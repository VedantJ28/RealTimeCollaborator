import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import attachSocket from './socket/index.js';

const server = http.createServer(app);
attachSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));