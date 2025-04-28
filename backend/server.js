const http = require('http');
const fs = require('fs');
const path = require('path');
const socketio = require('socket.io'); // <<< إضافة socket.io

const port = 3000;
const frontendPath = path.join(__dirname, '../frontend');

// إعداد السيرفر
const server = http.createServer((req, res) => {
    let filePath = path.join(frontendPath, req.url === '/' ? '/index.html' : req.url);
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg'
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - الملف غير موجود</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`خطأ: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// هنا نربط Socket.io
const io = socketio(server);

io.on('connection', (socket) => {
    console.log('📡 مستخدم جديد اتصل بالسيرفر');

    socket.on('sendLetter', (letter) => {
        console.log('📨 استلمنا حرف من المقدم:', letter);
        socket.broadcast.emit('receiveLetter', letter);
    });
});

server.listen(port, () => {
    console.log(`✅ السيرفر شغال على http://localhost:${port}`);
});
