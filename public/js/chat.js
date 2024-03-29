const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location-btn');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoscroll = () => {
	//getNewMessage
	const $newMessage = $messages.lastElementChild;

	//Height of the new message
	const newMessageStyles = getComputedStyle($newMessage);
	const margin = parseInt(newMessageStyles.marginBottom);
	const newMessageHight = $newMessage.offsetHeight + margin;

	//Visible height
	const visibleHeight = $messages.offsetHeight;

	//Height of messages container
	const containerHeight = $messages.scrollHeight;

	//How far have I scrolled
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

socket.on('message', (message) => {
	const html = Mustache.render(messageTemplate, {
		user: message.user,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm A'),
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('locationMessage', (loc) => {
	const html = Mustache.render(locationTemplate, {
		user: loc.user,
		url: loc.url,
		createdAt: moment(loc.createdAt).format('h:mm A'),
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	$sidebar.innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();

	$messageFormButton.setAttribute('disabled', 'disabled');
	const message = e.target.elements.message.value;
	socket.emit('sendMessage', message, (res) => {
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();
		if (res.error) {
			return console.log("Message wasn't delivered", res.error);
		}
		console.log('Message was delivered!');
	});
});

$sendLocationButton.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser.');
	}
	$sendLocationButton.setAttribute('disabled', 'disabled');

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			'sendLocation',
			{
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			},
			(res) => {
				if (res.error) {
					console.log('Location was not sent! ' + res.error);
				}
			}
		);
		$sendLocationButton.removeAttribute('disabled');
	});
});

socket.emit('join', { username, room }, (res) => {
	if (res.error) {
		alert(res.error);
		location.href = '/';
	}
});
