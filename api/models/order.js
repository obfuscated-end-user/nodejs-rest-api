// think of this entire thing as like an interface in other languages
const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({		// define schema (data rules)
	_id: mongoose.Schema.Types.ObjectId,	// unique ID (auto-generated)
	product: {
		type: mongoose.Schema.Types.ObjectId,	// product name (text)
		/**
		 * The name of the model i want to connect this model to, it has to be
		 * the exact same (see api/models/product.js).
		 * "I want to connect this Schema with `Product`"
		 */
		ref: "Product",
		required: true	// make this required
	},
	quantity: {
		type: Number,	// price (number)
		default: 1		// instead of this being mandatory, set a default value
	}
});

// create model
module.exports = mongoose.model("Order", orderSchema);