/*******************************************************************************
 * FileName: index.js
 * Description: It starts the server and contains the handlers.
 *******************************************************************************/

var server = require("./server");
var handlers = require("./handler");
var handle = {};

handle["authenticateUser"] = handlers.authenticateUser;
handle["createStory"] = handlers.createStory;
handle["startStory"] = handlers.startStory;
handle["acceptInvitation"] = handlers.acceptInvitation;
handle["refuseInvitation"] = handlers.refuseInvitation;
handle["disconnect"] = handlers.disconnect;
handle["sendStoryMessage"] = handlers.sendStoryMessage;

server.init(handle);
