/*******************************************************************************
 * FileName: db.js
 * Description: It contains functions used against the database
 *******************************************************************************/

var database_url = "db_stori";
var collections = ["users"];
var db = require("mongojs").connect(database_url, collections);

/**
 * Returns whether the user exists.
 *
 * @param email. User's email
 * @param id. User's id
 * @param callback. Function called after this function ends.
 */
var findUser = function (email, id, callback) {
	db.users.findOne({email: email}, function(err, userFound) {
		if (err || !userFound) {
			callback(0);
		} else {
			db.users.update({email: email}, {
				$set: {id: id}}, function(err, userUpdated) {
					if (err || !userUpdated) {
						callback(0);
					} else {
						callback(1);
					}
				}
			);
		}
	});
}

/**
 * Returns an user from the database
 *
 * @param email. User's email
 * @param callback. Function called after this function ends.
 */
var getUser = function (email, callback) {
	db.users.findOne({email: email}, function(err, userFound) {
		if (err || !userFound) { callback(undefined); } else { callback(userFound); }
	});
}

/**
 * Returns users of a room
 *
 * @param room. room id
 * @param callback. Function called after this function ends.
 */
var getUsersByRoom = function (room, callback) {
	db.users.find({room: db.ObjectId(room)}, function(err, usersFound) {
		if (err || !usersFound) { callback(undefined); } else { callback(usersFound); }
	});
}

/**
 * Save an user into the database
 *
 * @param email. User's email
 * @param password. User's password
 * @param room. Room where the user belongs to
 * @param turn. User's turn in the room
 * @param id. User's id
 * @param callback. Function called after this function ends.
 */
var saveUser = function (email, password, room, turn, id, callback) {
	db.users.save({email: email, password: password, room: room, turn: turn, id: id}, function(err, userSaved) {
		if (err || !userSaved) { callback(0); } else { callback(1); }
	});
}

/**
 * Delete an user from the database
 *
 * @param id. User's id
 * @param callback. Function called after this function ends.
 */
var deleteUser = function (id, callback) {
	db.users.remove({id: id}, function(err, userDeleted) {
		if (err || !userDeleted) { callback(0); } else { callback(1); }
	});
}

/**
 * Updates the turn of the user passed by parameter
 *
 * @param email. User's email
 * @param turn. User's turn
 * @param callback. Function called after this function ends.
 */
var updateTurn = function (email, turn, callback) {
	db.users.update({email: email}, {$set: {turn: turn}}, function(err, userUpdated) {
		if (err || !userUpdated) { callback(0); } else { callback(1); }
	});
}

/**
 * Updates the room of the user passed by parameter
 *
 * @param email. User's email
 * @param room. User's room
 * @param callback. Function called after this function ends.
 */
var updateRoom = function (email, room, callback) {
	db.users.update({email: email}, {$set: {room: room}}, function(err, userUpdated) {
		if (err || !userUpdated) { callback(0); } else { callback(1); }
	});
}

/**
 * Creates a room for the user passed by parameter
 *
 * @param email. User's email
 * @param callback. Function called after this function ends.
 */
var createRoom = function (email, callback) {
	var room = new db.ObjectId();	// Generation of an ID for the room

	// Get the user from the database
	getUser(email, function(user) {
		if (user === undefined) {
			callback(0);
		} else {
			if (user.room === "") {
				// If user isn't in a room, we update it with the new room ID
				updateRoom(user.email, room, function(res) {
					if (res > 0) { callback(1); } else { callback(0); }
				});
			} else {
				db.users.find({room: user.room}, function(err, users) {
					// If there aren't more users in that room
					if (err || !users || users.length <= 1) {
						updateRoom(user.email, room, function(res) {
							if (res > 0) { callback(1); } else { callback(0); }
						});
					} else { callback(0); } // User is already in a room
				});
			}
		}
	});
}

exports.saveUser = saveUser;
exports.findUser = findUser;
exports.getUser = getUser;
exports.getUsersByRoom = getUsersByRoom;
exports.deleteUser = deleteUser;
exports.createRoom = createRoom;
exports.updateRoom = updateRoom;
exports.updateTurn = updateTurn;
