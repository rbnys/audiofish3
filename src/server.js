const serverPort = process.env.PORT || 10000;
const backendURL = process.env.BACKEND_URL || `https://audiofish.onrender.com:${serverPort}`;
const serverIP = process.env.NODE_ENV === 'production' ? backendURL : `http://localhost:4001`;

export default serverIP;
