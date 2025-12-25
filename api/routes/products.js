const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

// can't find docs on this one
// https://expressjs.com/en/resources/middleware/multer.html
// https://github.com/expressjs/multer/tree/main
// DiskStorage configuration object
const storage = multer.diskStorage({
	destination:  function(req, file, cb) {
		// callback
		cb(null, "./uploads/");	// files go to uploads folder
	},
	filename: function(req, file, cb) {
		// cb(null, new Date().toISOString() + file.originalname);
		cb(null, Date.now() + file.originalname);	// 1703456789-original.jpg
	}
});
// file validation function
const fileFilter = (req, file, cb) => {
	// if jpeg or png file is passed
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		// accept the file
		cb(null, true);
	} else {
		// reject the file
		cb(null, false);
	}
}
// Multer middleware instance
const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 5	}, // only accept files below 5mb
	fileFilter: fileFilter
});

// import the model you created
const Product = require("../models/product");

// something something .exec().then() returns a Promise, look up more on that
// https://mongoosejs.com/docs/api/query.html
router.get("/", (req, res, next) => {	// matches GET /products
	Product.find()				// query "give all products"
		.select("name price _id productImage")	// select the fields you only need and discard the others
		.exec()					// execute query (returns Promise)
		.then(docs => {			// success: docs - array of Products
			const response = {
				count: docs.length,				// total Products found
				products: docs.map(doc => {		// transform each document
					return {
						name: doc.name,
						price: doc.price,
						productImage: doc.productImage,
						_id: doc._id,
						request: {	// HATEOAS link
							type: "GET",
							url: `http://localhost:3000/products/${doc._id}`
						}
					}
				})
			};
			// if (docs.length >= 0) {
				res.status(200).json(response);	// send JSON to browser
			// } else {
			// 	res.status(404).json({
			// 		message: "No entries found"
			// 	})
			// }
		})
		.catch(err => {	// something went wrong
			console.log(err);
			// 500 means server encountered an unexpected condition that
			// prevented it from fulfilling the request
			res.status(500).json({
				error: err
			});
		});
});

router.post("/", checkAuth, upload.single("productImage"), (req, res, next) => {		// matches POST /products
	const product = new Product({			// create a new product object
		_id: new mongoose.Types.ObjectId(),	// auto-generate unique ID
		name: req.body.name,				// from request: {"name": "test"}
		price: req.body.price,				// froom request {"price": "123"}
		productImage: req.file.path			// "./uploads/1703456789-cirno.jpg"
	});
	product							// save this in the database
		.save()						// writes to MongoDB
		.then(result => {			// success: result - saved Product
			console.log(result);
			res.status(201).json({	// send back new product
				message: "Created product successfully",
				createdProduct: {
					name: result.name,
					price: result.price,
					_id: result._id,
					request: {	// HATEOAS
						type: "GET",
						url: "http://localhost:3000/products/" + result._id
					}
				}
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
// GET /products/507f1f77bcf86cd799439011 for example
router.get("/:productId", (req, res, next) => {	// matches GET /products/id
	const id = req.params.productId;	// grab ID from URL
	Product.findById(id)				// query "find product with this ID"
		.select("name price _id productImage")	// limit fields
		.exec()							// execute (Promise)
		.then(doc => {					// success handler
			console.log("From database", doc);
			if (doc) {	// check if product exists
				res.status(200).json({
					product: doc,	// { name, price, _id, productImage }
					request: {
						type: "GET",
						url: "http://localhost:3000/products"
					}
				});
			} else {
				res.status(404).json({	// nothing exists
					message: "No valid entry found for provided ID"
				})
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({error: err});
		});
});

router.patch("/:productId", checkAuth, (req, res, next) => {	// matches PATCH /products/
	// productId has to be the same name as above
	const id = req.params.productId;			// grab ID from URL
	// build update object
	const updateOps = {};						// empty object for updates
	for (const ops of req.body) {				// loop through request body
		updateOps[ops.propName] = ops.value;	// build: {name: "new name"}
	}
	// update() is deprecated
	// https://www.mongodb.com/docs/manual/reference/method/db.collection.updateone/
	// https://www.mongodb.com/docs/manual/reference/operator/update/set/
	// basically, $set tells MongoDB(?) to update only the fields specified in the passed object (updateOps)
	// if i did `Product.updateOne({ _id: id }, updateOps)`, i will
	// replace the ENTIRE object instead of patching it
	Product.updateOne({ _id: id }, { $set: updateOps })	// MongoDB update
		.exec()
		.then(result => {
			console.log(result);
			res.status(200).json({
				message: "Product updated",
				request: {
					type: "GET",
					url: "http://localhost:3000/products/" + id
				}
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

router.delete("/:productId", checkAuth, (req, res, next) => {	// matches DELETE /products/
	const id = req.params.productId;		// grab ID from URL
	// Product.remove() is deprecated and guy in comments suggested this instead
	Product.deleteOne({ _id: id })			// MongoDB "delete where _id = id"
		.exec()
		.then(result => {					// success shows what happened
			res.status(200).json({
				message: "Product deleted",
				request: {	// HATEOAS
					type: "POST",
					url: "http://localhost:3000/products/",
					body: {	// show user expected POST format
						name: "String",
						price: "Number"
					}
				}
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
});

module.exports = router;