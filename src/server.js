const serverPort = process.env.PORT || 4001;
const backendURL = process.env.BACKEND_URL || `https://audiofish.onrender.com:${serverPort}`;
const serverIP = process.env.NODE_ENV === 'production' ? backendURL : `http://localhost:${serverPort}`;

export default serverIP;
