// think of this entire thing as like an interface in other languages
const mongoose = require("mongoose");

const productSchema = mongoose.Schema({		// define schema (data rules)
	_id: mongoose.Schema.Types.ObjectId,	// unique ID (auto-generated)
	name: {
		type: String,	// product name (text)
		required: true	// make this required
	},
	price: {
		type: Number,	// price (number)
		required: true
	},
	productImage: {		// image URL
		type: String,
		required: true
	}
});

// create model
module.exports = mongoose.model("Product", productSchema);