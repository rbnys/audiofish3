const serverIP = process.env.NODE_ENV === 'production' ? 'http://audio.fish:4001' : 'http://localhost:4001';

export default serverIP;
