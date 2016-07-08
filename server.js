var express = require('express')
	, app = express(app)
	, server = require('http').createServer(app);

app.use(express.static(__dirname));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});

// Get EurecaServer class
var Eureca = require('eureca.io');

// Create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:['setID', 
	'getNick', 
	'updateLobby',
	'loadPlayersLR',
	'spawnEnemy', 
	'kill', 
	'updateState', 
	'getChar', 
	'compensate', 
	'broadcast'
]});
// initialize server core data
var clients = {};
var connectedCount = 0;
var lobbylist = {};

// Initialize public lobby
lobbylist['publicLobby1'] = {gameType:'Team Death Match', maxPlayers:4, status:'Open Host', password:'', clientInfo:{}, playerCount:0};
lobbylist['publicLobby2'] = {gameType:'Team Death Match', maxPlayers:6, status:'Open Host', password:'', clientInfo:{}, playerCount:0};
lobbylist['publicLobby3'] = {gameType:'Team Death Match', maxPlayers:8, status:'Open Host', password:'', clientInfo:{}, playerCount:0};
lobbylist['publicLobby4'] = {gameType:'Team Death Match', maxPlayers:12, status:'Open Host', password:'', clientInfo:{}, playerCount:0};


//var selectedChar = "test";

// Attach eureca.io to our http server
eurecaServer.attach(server);

// Detect client connection
eurecaServer.onConnect(function(conn) {
	var remote = eurecaServer.getClient(conn.id);
	// Client contains id, remote, and selected character
	clients[conn.id] = {
		id:conn.id, 
		remote:remote, 
		lobbyID:'',
		team: null,
		ready:false
	};
	//clients[conn.id] = {id:conn.id, remote:remote, char:selectedChar};
	
	// Set client's nickname
	remote.getNick().onReady(function(result) {
		clients[conn.id].nick = result;
	});

	/* Separated for now. Affects multiplayer
	// Set client's selected character
	remote.getChar().onReady(function(result) {
		clients[conn.id].char = result;
	});
	*/

	// setID method in client side
	remote.setID(conn.id);			

	// test output
	connectedCount++;
	console.log('Client connected id=%s ', conn.id, conn.remoteAddress);
});

// Detect client disconnection
eurecaServer.onDisconnect(function(conn) {
	console.log('Client disconnected id=%s ', conn.id, conn.remoteAddress);
	connectedCount--;

	var removeID = clients[conn.id].id;

	// check if disconnected client is in a lobby
	if (clients[conn.id].lobbyID != '') {
		eurecaServer.exports.destroyRoomLink(clients[conn.id].lobbyID, conn.id);
	}

	delete clients[conn.id];

	for (var c in clients) {
		var remote = clients[c].remote;

		// Kill method in client side
		remote.kill(conn.id);
	}
});

// function to update player status in a lobby room
eurecaServer.exports.updateLobbyRoom = function(roomName) {
	// for every client in the lobby, update their lobby room info
	for (var id in lobbylist[roomName].clientInfo) { 
		var remote = lobbylist[roomName].clientInfo[id].remote;
		remote.loadPlayersLR(lobbylist[roomName].clientInfo); // Share clientinfo with all clients in the lobby
	}
}

eurecaServer.exports.setClientTeam = function(roomName, id, team) {
	clients[id].team = team;
	eurecaServer.exports.updateLobbyRoom(roomName);
}

// function to add and update lobby information wtih connected player id
// REF: Each obj in clientInfo is a clients[conn.id]
eurecaServer.exports.establishRoomLink = function(roomName, id) {
	console.log("Player: " + id + " connected to room " + roomName);
	clients[id].lobbyID = roomName; // update client lobby room status
	lobbylist[roomName].clientInfo[id] = clients[id]; // pass in the client object into clientInfo
	lobbylist[roomName].playerCount++;
	eurecaServer.exports.requestClientInfo(); // update all lobby clients
}

// function to remove and update lobby information wtih connected player id
eurecaServer.exports.destroyRoomLink = function(roomName, id) {
	//console.log("Player: " + id + " disconnected to room " + roomName);
	clients[id].lobbyID = ''; // update client lobby room status
	clients[id].team = null;
	clients[id].ready = false;
	delete lobbylist[roomName].clientInfo[id];
	lobbylist[roomName].playerCount--;
	eurecaServer.exports.requestClientInfo(); // update all lobby clients
}

// function to update public lobby status
eurecaServer.exports.requestClientInfo = function() {
	for (var c in clients) {
		var remote = clients[c].remote;
		remote.updateLobby(connectedCount, 
			lobbylist['publicLobby1'], 
			lobbylist['publicLobby2'], 
			lobbylist['publicLobby3'], 
			lobbylist['publicLobby4']
		);
	}
}

// function to validate if the client provided the correct credential
// to enter the lobby room
eurecaServer.exports.passwordCheck = function(name, pass) {
	if (lobbylist[name] != null) {
		if (lobbylist[name].password == pass) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

eurecaServer.exports.handshake = function() {
	console.log('handshaking');
	for (var c in clients) {
		var remote = clients[c].remote;
		var test = clients[c];
		for (var cc in clients) {
			// Get starting position for every client
			var x = 0;
			var y = 0;
			if (clients[cc].lastState != null) {
				x = clients[cc].lastState.x;
				y = clients[cc].lastState.y;
			}
			// Replicate enemy at position, along with selected character
			remote.spawnEnemy(clients[cc].id, x, y, clients[cc].char);
		}
	}
}

eurecaServer.exports.handleKeys = function(keys) {
	//console.log('handling');
	var conn = this.connection;
	var updatedClient = clients[conn.id];

	// For each client, update last input
	for (var c in clients) {
		// Update server side
		var remote = clients[c].remote;
		remote.updateState(updatedClient.id, keys);

		// Key track of last state for spawning new players
		clients[c].lastState = keys;
	}
}

eurecaServer.exports.compensate = function(keys) {
	// Compensate difference by interpolation
	var conn = this.connection;
	var updatedClient = clients[conn.id];

	// For each client, update last input
	for (var c in clients) {
		// Update server side
		var remote = clients[c].remote;
		remote.compensate(updatedClient.id, keys);

		// Key track of last state for spawning new players
		clients[c].lastState = keys;
	}
}

// Either listen to host port or 8000 if testing locally
server.listen(process.env.PORT || 8000);