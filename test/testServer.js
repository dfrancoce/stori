var should = require('should');
var io = require('socket.io-client'), server = require('../src/server');

var socketURL = 'http://localhost:8080';

var options ={
    'forceNew': true
};

var user1 = {'email': 'stannis@gmail.com', 'password': 'T@mY1xz'};
var user2 = {'email': 'sansa@gmail.com', 'password': 'SsAj4x5'};
var user3 = {'email': 'jon@gmail.com', 'password': 'Jae9SzG'};

describe("My Server", function () {
    it('Should authenticate an user', function (done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function () {
            client.emit('authenticateUser', user1, function (data) {
                console.log(data);
                data.response.should.equal('OK');

                done();
            });
        });
    });
});