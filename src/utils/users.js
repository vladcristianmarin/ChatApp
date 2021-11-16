const users = [];

//addUser
const addUser = ({ id, username, room }) => {
	//clean the data
	username =
		username.trim().charAt(0).toUpperCase() + username.trim().substr(1);
	room = room.trim().charAt(0).toUpperCase() + room.trim().substr(1);

	//Validate the data
	if (!username || !room) {
		return { error: 'Username and room are required!' };
	}

	//Check for existing user
	if (users.find((user) => user.username === username && user.room === room)) {
		return { error: 'Username already taken!' };
	}

	//Store users
	user = { id, username, room };
	users.push(user);
	return { user };
};

//removeUser
const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);
	if (index === -1) {
		return { error: 'User does not exist' };
	}
	return users.splice(index, 1)[0];
};
//getUser
const getUser = (id) => {
	return users.find((user) => user.id === id);
};

//getUsersInRoom
const getUsersInRoom = (room) => {
	if (!room) return [];
	room = room.trim().charAt(0).toUpperCase() + room.trim().substr(1);
	return users.filter((user) => user.room === room);
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
};
