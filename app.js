// import libraries/modules/whatever
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// your routes
const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

// connects to MongoDB Atlas (cloud database)
mongoose.connect(
	`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@api001.sfqykhd.mongodb.net/?appName=API001`
);
// omits warnings?
mongoose.Promise = global.Promise;
/*
// this bit doesn't work for me
// update: deprecated, don't use
{
	useMongoClient: true
}
*/

const app = express();

// set up express middleware (yes, that's what these things are called)
// they're called that because they run in the "middle" of the request-response
// cycle
// morgan - logs requests (like "GET /products 200 2.3ms") etc
app.use(morgan("dev"));
// make this folder publicly available
// http://localhost:3000/uploads/file.ext
// if "/uploads" is removed from app.use(), then the URL will be
// http://localhost:3000/file.ext
app.use("/uploads", express.static("uploads"));
// bodyParser - parses JSON/form data from requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// routes which should handle requests
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

/*
buzzwords ahead but who cares
CORS (cross-origin resource sharing) is a security feature built into web
browsers that controls how web pages from one domain can request and access
resources from another domain. By default, browsers block these requests unless
the server explicitly allows them.
*/
app.use((req, res, next) => {
	// allow any domain to make requests to this API
	res.header("Access-Control-Allow-Origin", "*");
	// tells the browser which HTTP headers are allowed to be sent in
	// cross-origin requests to this API
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	// handle CORS preflight requests
	// when a browser makes a complex request like one using PUT, PATCH, DELETE
	// or w/ custom headers, it first sends an `OPTIONS` request to check if the
	// server allows such requests
	if (req.method === "OPTIONS") {
		res.header(
			"Access-Control-Allow-Methods",
			"PUT, POST, PATCH, DELETE, GET"
		);
		return res.status(200).json({})
	}
	// pass control to the next middleware or route handler in the stack
	// if you remove this like you did before, the request will hang and never
	// be completed, because Express will wait for a response or further
	// instructions
	next();
});

/*
This middleware runs if no previous route like `/products` or `/orders` matched
the incoming request, meaning the requested endpoint doesn't exist.
It creates a new error object, then passes this error to the next middleware
using `next(error);`.
*/
app.use((req, res, next) => {
	const error = new Error("Not found");
	error.status = 404;
	// forward this error request
	next(error);
});

/*
When an error is forwarded, like the 404 error from the previous middleware,
this function catches it, sets the response status to the error's status
(or 500 if not specified), and sends a JSON response with the error message.
*/
app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	})
});

module.exports = app;