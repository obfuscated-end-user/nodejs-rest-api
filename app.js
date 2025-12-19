const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

mongoose.connect(
	"mongodb+srv://dimensionalbleedthrough48_db_user:" + process.env.MONGODB_PASSWORD + "@api001.sfqykhd.mongodb.net/?appName=API001",
);
/*
// this bit doesn't work for me
{
	useMongoClient: true
}
*/

const app = express();

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// prevent CORS errors
// makes the app not work for me for some reason
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	if (req.method === "OPTIONS") {
		res.header(
			"Access-Control-Allow-Methods",
			"PUT, POST, PATCH, DELETE, GET"
		);
		return res.status(200).json({})
	}
	next();
});

// "middleware"
// Routes which should handle requests
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// if we make it past these two ^, it means none of the routes worked and send this instead
app.use((req, res, next) => {
	const error = new Error("Not found");
	error.status = 404;
	// forward this error request
	next(error);
});

// if we make it past the previous one then handle if again here
// at least that's what what i was told
app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	})
});

module.exports = app;