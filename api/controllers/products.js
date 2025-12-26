const mongoose = require("mongoose");
const Product = require("../models/product");

exports.products_get_all = (req, res, next) => {
	Product.find()				// query "give all products"
		// select the fields you only need and discard the others
		.select("name price _id productImage")
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
						request: {	// HATEOAS
							type: "GET",
							url: `http://localhost:3000/products/${doc._id}`
						}
					}
				})
			};
			res.status(200).json(response);	// send JSON to browser
		})
		.catch(err => {	// something went wrong
			console.log(err);
			// 500 means server encountered an unexpected condition that
			// prevented it from fulfilling the request
			res.status(500).json({
				error: err
			});
		});
};

exports.products_create_product = (req, res, next) => {
	const product = new Product({			// create a new product object
		_id: new mongoose.Types.ObjectId(),	// auto-generate unique ID
		name: req.body.name,				// from request: {"name": "test"}
		price: req.body.price,				// froom request {"price": "123"}
		productImage: req.file.path			// "./uploads/1703456789-cirno.jpg"
	});
	product
		.save()					// save this in the database, writes to MongoDB
		.then(result => {		// success: result - saved Product
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
};

exports.products_get_product = (req, res, next) => {
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
};

exports.products_update_product = (req, res, next) => {
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
	// basically, $set tells MongoDB(?) to update only the fields specified in
	// the passed object (updateOps)
	// if i did `Product.updateOne({ _id: id }, updateOps)`, i will replace the
	// ENTIRE object instead of patching it
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
};

exports.products_delete = (req, res, next) => {
	const id = req.params.productId;	// grab ID from URL
	// Product.remove() is deprecated and guy in comments suggested this instead
	Product.deleteOne({ _id: id })	// MongoDB "delete where _id = id"
		.exec()
		.then(result => {			// success shows what happened
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
};