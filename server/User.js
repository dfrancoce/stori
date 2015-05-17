/*******************************************************************************
 * FileName: User.js
 * Description: It represents an User
 *******************************************************************************/

var db = require("./db");

var User = function (emailParam, passwordParam) {
	var email = emailParam, password = passwordParam, id, room, turn;

	var getEmail = function() {
		return email;
	};

	var getPassword = function() {
		return password;
	};

	var getId = function() {
		return id;
	};

	var getRoom = function() {
		return room;
	};

	var getTurn = function() {
		return turn;
	};

	var setEmail = function(newEmail) {
		email = newEmail;
	};

	var setPassword = function(newPassword) {
		password = newPassword;
	};

	var setId = function(newId) {
		id = newId;
	};

	var setRoom = function(newRoom) {
		room = newRoom;
	};

	var setTurn = function(newTurn) {
		turn = newTurn;
	};

	// if user exists doesn't exist, it saves it
	var authenticateUser = function(callback) {
		db.findUser(email, id, function(result) {
			if (result === 0) {
				db.saveUser(email, password, room, turn, id, function(result) {
					if (result === 0) { callback(0); } else { callback(1); }
			});
		} else { callback(1); }
	});
}

	return {
		getEmail: getEmail,
		getPassword: getPassword,
		getId: getId,
		getRoom: getRoom,
		getTurn: getTurn,
		setEmail: setEmail,
		setPassword: setPassword,
		setId: setId,
		setRoom: setRoom,
		setTurn: setTurn,
		authenticateUser: authenticateUser
	}
};

exports.User = User;
