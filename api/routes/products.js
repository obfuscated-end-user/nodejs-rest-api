const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// import the model you created
const Product = require("../models/product");

// something something .exec().then() returns a Promise, look up more on that
router.get("/", (req, res, next) => {	// matches GET /products
	Product.find()				// query "give all products"
		.exec()					// execute query (returns Promise)
		.then(docs => {			// success: docs - array of products
			console.log(docs);
			// if (docs.length >= 0) {
				res.status(200).json(docs);	// send JSON to browser
			// } else {
			// 	res.status(404).json({
			// 		message: "No entries found"
			// 	})
			// }
		})
		.catch(err => {			// something went wrong
			console.log(err);
			// 500 means server encountered an unexpected condition that
			// prevented it from fulfilling the request
			res.status(500).json({
				error: err
			});
		});
});

router.post("/", (req, res, next) => {		// matches POST /products
	const product = new Product({			// create a new product object
		_id: new mongoose.Types.ObjectId(),	// auto-generate unique ID
		name: req.body.name,				// from request: {"name": "test"}
		price: req.body.price				// froom request {"price": "123"}
	});
	product							// save this in the database
		.save()						// writes to MongoDB
		.then(result => {			// success: result - saved product
			console.log(result);
			res.status(201).json({	// send back new product
				message: "Handling POST requests to /products",
				createdProduct: result
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			})
		});
});

// get w/ id
router.get("/:productId", (req, res, next) => {	// matches /products/id
	const id = req.params.productId;	// grab ID from URL
	Product.findById(id)				// query "find product with this ID"
		.exec()							// execute (Promise)
		.then(doc => {					// success handler
			console.log("From database", doc);
			if (doc) {	// check if product exists
				res.status(200).json(doc);	// yes, then send product
			} else {
				res.status(404).json({		// nothing exists
					message: "No valid entry found for provided ID"
				})
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({error: err});
		});
});

router.patch("/:productId", (req, res, next) => {	// matches PATCH /products/
	// productId has to be the same name as above
	const id = req.params.productId;			// grab ID from URL
	const updateOps = {};						// empty object for updates
	for (const ops of req.body) {				// loop through request body
		updateOps[ops.propName] = ops.value;	// build: {name: "new name"}
	}
	// update() is deprecated
	Product.updateOne({ _id: id }, { $set: updateOps })	// MongoDB update
		.exec()
		.then(result => {
			console.log(result);
			res.status(200).json(result);		// send update result
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

router.delete("/:productId", (req, res, next) => {	// matches DELETE /products/
	const id = req.params.productId;		// grab ID from URL
	// Product.remove() is deprecated and guy in comments suggested this instead
	Product.deleteOne({ _id: id })			// MongoDB "delete where _id = id"
		.exec()
		.then(result => {					// success shows what happened
			res.status(200).json(result);	// send result to client
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;