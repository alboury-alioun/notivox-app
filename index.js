const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bienvenue sur Notivox !');
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Serveur lancé sur le port 3000');
});
