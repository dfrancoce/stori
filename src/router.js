/*******************************************************************************
 * FileName: router.js
 * Description: it routes the requests from the clients
 *******************************************************************************/

function route(handle, method, io, client, data) {
	if (typeof handle[method] === 'function') {
		switch (method) {
			case "authenticateUser":
				handle[method](client, data);
				break;
			case "createStory":
				handle[method](io, client, data);
				break;
			case "acceptInvitation":
				handle[method](io, client, data);
				break;
			case "refuseInvitation":
				handle[method](io, client, data);
				break;
			case "startStory":
				handle[method](io, data);
				break;
			case "sendStoryMessage":
				handle[method](io, data);
				break;
			case "disconnect":
				handle[method](client);
				break;
		}
	}
}

exports.route = route;
