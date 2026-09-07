/**
 * Hostinger's Node.js app manager runs a startup file directly with `node`,
 * rather than `npm start` — so `next start` needs this small wrapper to boot
 * the production server and listen on the port Hostinger assigns via PORT.
 */
const { createServer } = require("http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Ready on port ${port}`);
  });
});
