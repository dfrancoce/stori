var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:8080';

var options ={
    transports: ['websocket'],
    'force new connection': true
};

var user1 = {'email': 'stannis@gmail.com', 'password': 'T@mY1xz'};
var user2 = {'email': 'sansa@gmail.com', 'password': 'SsAj4x5'};
var user3 = {'email': 'jon@gmail.com', 'password': 'Jae9SzG'};

describe("My Server", function () {
    it('Should authenticate an user', function (done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function () {
            client.emit('authenticateUser', user1, function (data) {
                data.response.should.equal('OK');
                done();
            })
        });
    });
});