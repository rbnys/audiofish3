import socketIOClient from 'socket.io-client';
import serverIP from './server';

let socket = socketIOClient(serverIP, {
	auth: {
		token: localStorage.getItem('token')
	}
});

export default socket;
