// creates raw HTTP servers
const http = require("http");
// import app.js
const app = require("./app");

// localhost:3000
// process.env.PORT for hosting platforms, otherwise do 3000
const port = process.env.PORT || 3000;
/**
 * Create an HTTP server and tells it to use the Express app to handle all
 * incoming requests.
 */
const server = http.createServer(app);

/**
 * Listening means that the server is actively waiting for incoming HTTP
 * requests on a specific port, in this case, 3000 or something.
 */
server.listen(port);