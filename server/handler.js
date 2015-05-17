/*******************************************************************************
 * FileName: handler.js
 * Description: Creates the server and attends the requests
 *******************************************************************************/

var User = require("./User").User;
var db = require("./db");

/**
 * Authenticate the user against the database. If it doesn't
 * exist, it inserts it into the database.
 * @param client. Client to autenticate
 * @param data. Data sent.
 * @returns
 */
function authenticateUser(client, data) {
	// Creates new User
	var my_user = new User(data.email, data.password);

	// Setting properties
	my_user.setRoom("");
	my_user.setTurn("");
	my_user.setId(client.id);

	my_user.authenticateUser(function(res) {
		if (res > 0) {
			client.emit("authenticateUser", {response: "OK"});
		} else {
			client.emit("authenticateUser", {response: "KO"});
		}
	});
}

/**
 * Get the users of the story
 * @param users. {String} Users of the story.
 * @param callback. Function called after this function ends.
 * @returns
 */
function getStoryUsers(users, callback) {
	var host = users[0], story_users = [], u;

	// Create the room for the story
	db.createRoom(host, function(res) {
		if (res > 0) {
			// We get the info from the db for each user
			for (var i = 0, l = users.length; i < l; i++) {
				db.getUser(users[i], function(user) {
					if (user !== undefined) {
						u = new User(user.email, user.password);

						u.setId(user.id);
						u.setRoom(user.room);
						u.setTurn(user.turn);
						story_users.push(u);
					}
				});
			};
		}

		setTimeout(function() { callback(story_users); }, 1000);
	});
}

/**
 *
 * @param io. Socket.
 * @param client. Client that creates the story
 * @param data. Data ent.
 * @returns
 */
function createStory(io, client, data) {
	var users, genre, type, host, room, id, email;

	// Get users, genre and type
	users = data.users.split(",");
	genre = data.genre;
	type = data.type;

	// Obtain users
	getStoryUsers(users, function(story_users) {
		if (story_users !== []) {
			host = story_users[0];
			room = host.getRoom();
			id = host.getId();
			email = host.getEmail();

			db.updateTurn(host.getEmail(), 1, function(res) {
				if (res > 0) {
					client.join(room); // Join to the room
					// Emit room to the client
					io.sockets.socket(id).emit("roomCreated", {room: room});
					story_users.splice(0,1); // Remove host user
					story_users.forEach(function (element, index, array) {
						// Emit invitations
						io.sockets.socket(element.getId()).emit("getInvitation",{user: email, genre: genre, type: type, room: room});
					});
				}
			});
		}
	});
}

/**
 * Start story. Sends story writers to each user
 * @param io. Socket
 * @param data. Data sent
 * @returns
 */
function startStory(io, data) {
	var room = data.room, users = data.users.split(",");;
	var turns = new Array();

	db.getUsersByRoom(room, function(us) {
		for (var i = us.length;i--;) {
			for (var j = users.length;j--;) {
				if (us[i].email === users[j]) {
					turns.push({user: us[i].email, turn: us[i].turn});
					break;
				}
			}
		}

		io.sockets.in(room).emit("getStoryWriters", {turns: turns, users: data.users});
	})
}

/**
 * The client accepted the invitation to write the story
 * @param io. Socket
 * @param client. Client that accepted the invitation
 * @param data. Data sent
 * @returns
 */
function acceptInvitation(io, client, data) {
	var host_email, guest_email, turn;

	host_email = data.host;
	guest_email = data.guest;

	db.getUser(host_email, function(user) {
		if (user !== undefined) {
			if (user.room !== "") {
				db.updateRoom(guest_email, user.room, function (res) {
					if (res > 0) {
						turn = io.sockets.clients(user.room).length + 1;

						db.updateTurn(guest_email, turn, function (res) {
							client.join(user.room);
							io.sockets.socket(user.id).emit("invitationAccepted", {guest: guest_email, turn: turn});
							io.sockets.socket(client.id).emit("getTurn", {turn: turn});
						});
					}
				});
			}
		}
	});
}

/**
 * The client refused the invitation
 * @param io. Socket.
 * @param client. Client that refused the invitation.
 * @param data. Data sent.
 * @returns
 */
function refuseInvitation(io, client, data) {
	var host_email, guest_email, turn;

	host_email = data.host;
	guest_email = data.guest;

	// Get host user
	db.getUser(host_email, function(user) {
		if (user !== undefined) {
			if (user.room !== "") { // Check the room exists
				// Send to the host that this guest refused the invitation
				io.sockets.socket(user.id).emit("invitationRefused", {guest: guest_email});
			}
		}
	});
}

/**
 * Sends a story message
 * @param io. Socket
 * @param data. Data sent
 * @returns
 */
function sendStoryMessage(io, data) {
	var room, turn, message, next_turn;

	room = data.room;
	turn = data.turn;
	message = data.message;

	// Sets next turn
	if (turn >= io.sockets.clients(room).length) {
		next_turn = 1;
	} else {
		next_turn = turn + 1;
	}

	io.sockets.in(room).emit("getStoryMessage", {message: message, turn: next_turn});
}

/**
 * Deletes the user disconnected
 * @param client. Client disconnected.
 * @returns
 */
function disconnect(client) {
	db.deleteUser(client.id, function(res) {
		if (res > 0) { console.log("Cliente " + client.id + " eliminado"); }
	})
}

exports.authenticateUser = authenticateUser;
exports.createStory = createStory;
exports.startStory = startStory;
exports.acceptInvitation = acceptInvitation;
exports.refuseInvitation = refuseInvitation;
exports.disconnect = disconnect;
exports.sendStoryMessage = sendStoryMessage;
