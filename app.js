const express = require("express");
const app = express();
const morgan = require("morgan");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

app.use(morgan("dev"));

// request, response, next
/* app.use((req, res, next) => {
	res.status(200).json({
		message: "It works!"
	});
}); */
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