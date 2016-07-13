/*******************************************************************************
 * FileName: server.js
 * Description: Creates the server and attends the requests
 *******************************************************************************/

var util = require("util");
var router = require("./router");
var app = require('express')(),
		server = require('http').createServer(app),
		io = require('socket.io').listen(server),
		port = 8080;


var socket, handler, router;

/**
 * Initializes the src
 *
 * @param handlerManager. Handler with the
 * functions of the src
 */
function init(handlerManager) {
	server.listen(port);
	app.get('/', function (req, res) {
		res.writeHead(200, {
			'Content-type':'text/javascript',
			'Access-Control-Allow-Origin': '*'
		});
	});

	handler = handlerManager;
	setEventHandlers();
	util.log('Server initialized');
}

/**
 * Listen to the connection event
 */
var setEventHandlers = function() {
	io.sockets.on("connection", onSocketConnection);
};

/**
 * Listen to the events
 *
 * @param client. Client connected
 */
function onSocketConnection(client) {
	util.log("New client connected: " + client.id);

	client.on("authenticateUser", onAuthenticateUser);
	client.on("disconnect", onClientDisconnect);
	client.on("createStory", onCreateStory);
	client.on("startStory", onStartStory);
	client.on("acceptInvitation", onAcceptInvitation);
	client.on("refuseInvitation", onRefuseInvitation);
	client.on("sendStoryMessage", onSendStoryMessage);
}

/**
 * User Authentication. Route to the handler function.
 * @param data
 */
function onAuthenticateUser(data) {
	util.log("User Authentication");
	router.route(handler, "authenticateUser", io, this, data);
}

/**
 * Client disconnects. Route to the handler function.
 * @param data
 */
function onClientDisconnect(data) {
	util.log("Client disconnects");
	router.route(handler, "disconnect", io, this, data);
}

/**
 * Create a story. Route to the handler function.
 * @param data
 */
function onCreateStory(data) {
	util.log("Creating a story");
	router.route(handler, "createStory", io, this, data);
}

/**
 * Start a story. Route to the handler function.
 * @param data
 */
function onStartStory(data) {
	util.log("Starting a story");
	router.route(handler, "startStory", io, this, data);
}

/**
 * Accepts an invitation. Route to the handler function.
 * @param data
 */
function onAcceptInvitation(data) {
	util.log("User " + data["guest"] + " accepted the invitation to start a story with user " + data["host"]);
	router.route(handler, "acceptInvitation", io, this, data);
}

/**
 * Refuses invitation. Route to the handler function.
 * @param data
 */
function onRefuseInvitation(data) {
	util.log("User " + data["guest"] + " refused the invitation to start a story with user " + data["host"]);
	router.route(handler, "refuseInvitation", io, this, data);
}

/**
 * Sends story message. Route to the handler function.
 * @param data
 */
function onSendStoryMessage(data) {
	util.log("Sent new text");
	router.route(handler, "sendStoryMessage", io, this, data);
}

exports.init = init;
