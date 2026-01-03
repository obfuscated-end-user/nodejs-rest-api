const Order = require("../models/order");
const Product = require("../models/product");
const mongoose = require("mongoose");

exports.orders_get_all = (req, res, next) => {
	/**
	 * mongoose.Schema.find().exec().then().catch() is a common pattern here
 	 * https://mongoosejs.com/docs/api/query.html
	 */
	Order.find()
		// https://stackoverflow.com/questions/15480934/why-is-there-an-underscore-in-front-of-the-mongodb-document-id
		.select("product quantity _id")
		/**
		 * Instead of getting the foreign key of that product, put the product
		 * itself here instead and show its relevant data.
		 * `name` refers to only show name field, but you can call this as just
		 * `populate("product")` and it will show all fields related to product.
		 * Separate the fields with a space to show those fields as in
		 * `populate("product", "name price")`.
		 */
		.populate("product", "name")
		.exec()
		.then(docs => {
			// 200 is a request succeeded.
			res.status(200).json({
				count: docs.length,	// You know, like, "3".
				/**
				 * So this returns a list, array, whatever it's called.
				 * `map()` transforms each individual MongoDB document (`doc`).
				 */
				orders: docs.map(doc => {
					return {
						_id: doc._id,
						product: doc.product,
						quantity: doc.quantity,
						request: {	// Add navigation link (HATEOAS).
							type: "GET",
							url: `http://localhost:3000/orders/${doc._id}`
						}
					}
				})
			});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
}

exports.orders_create_order = (req, res, next) => {
	Product.findById(req.body.productId)
		.then(product => {
			if (!product) {	// if product doesn't exist
				return res.status(404).json({
					message: "Product not found"
				});
			}
			// Create a new `Order` instance.
			const order = new Order({
				// You need the `new` keyword here. (not in the video)
				_id: new mongoose.Types.ObjectId(),	// generate unique MongoDB ID
				quantity: req.body.quantity,		// from request (e.g. 3)
				product: req.body.productId			// reference an existing Product's ID
			});
			// Persist to database, returns `Promise`.
			return order.save()	// Chains to next `then()`.
		})
		.then(result => {	// `result` is a saved order document.
			console.log(result);
			/**
			 * 201 indicates that the HTTP request has led to the creation
			 * of a resource.
			 */
			res.status(201).json({
				message: "Order stored",
				createdOrder: {
					_id: result._id,
					product: result.product,
					quantity: result.quantity
				},
				/**
				 * https://en.wikipedia.org/wiki/HATEOAS
				 * "GET this specific URL to view the order you just created"
				 */
				request: {
					type: "GET",
					url: `http://localhost:3000/orders/${result._id}`
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

exports.orders_get_order = (req, res, next) => {
	Order.findById(req.params.orderId)	// :orderId becomes req.params.orderId
		.populate("product")
		.exec()
		.then(order => {
			// avoid getting `null`
			if (!order) {
				return res.status(404).json({
					message: "Order not found"
				});
			}
			res.status(200).json({	// success, sends back the id
				order: order,		// order object { _id, product, quantity }
				request: {			// HATEOAS
					type: "GET",
					url: "http://localhost:3000/orders/"
				}
			});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
};

exports.orders_delete_order = (req, res, next) => {
	// DO NOT USE remove()
	Order.deleteOne({ _id: req.params.orderId })
		.exec()
		.then(result => {
			res.status(200).json({	// sends back the id
				message: "Order deleted",
				request: {
					type: "POST",	// suggest the user to create a new order
					url: "http://localhost:3000/orders/",	// by using this URL
					body: {			// shows the format they need to follow
						productId: "ID",
						quantity: "Number"
					}
				}
			});
		})
		.catch(err => {
			res.status(500).json({
				error: err
			});
		});
};