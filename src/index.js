const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
// const Filter = require('bad-words');
const {
	generateMessage,
	generateLocationMessage,
} = require('./utils/messages');
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.port || 3000;
const publicDir = path.join(__dirname, '../public');

app.use(express.static(publicDir));

io.on('connection', (socket) => {
	console.log('New WebSocket connection');

	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return callback({ error });
		}

		socket.join(user.room);
		socket.emit('message', {
			user: 'Server',
			...generateMessage(`Welcome ${user.username}!`),
		});
		socket.broadcast.to(user.room).emit('message', {
			user: 'Server',
			...generateMessage(`${user.username} has joined!`),
		});

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room),
		});

		callback({});
	});

	socket.on('sendMessage', (message, callback) => {
		// const filter = new Filter();
		// if (filter.isProfane(message)) {
		// 	return callback('Profanity is not allowed!');
		// }
		if (!message) {
			return callback({ error: 'Cannot send empty messages!' });
		}
		const user = getUser(socket.id);
		if (!user) return callback({ error: 'User not found!' });
		io.to(user.room).emit('message', {
			user: user.username,
			...generateMessage(message),
		});
		callback({});
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		user &&
			io.to(user.room).emit('message', {
				user: 'Server',
				...generateMessage(`${user.username} has left!`),
			});

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room),
		});
	});

	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id);
		if (!user) return callback({ error: 'User not found!' });
		io.to(user.room).emit('locationMessage', {
			user: user.username,
			...generateLocationMessage(
				`https://google.com/maps?q=${location.lat},${location.lng}`
			),
		});
		callback({});
	});
});

server.listen(port, () => {
	console.log('Server started on port ' + port);
});
