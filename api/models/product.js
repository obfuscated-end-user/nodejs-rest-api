// think of this entire thing as like an interface in other languages
const mongoose = require("mongoose");

const productSchema = mongoose.Schema({		// define schema (data rules)
	_id: mongoose.Schema.Types.ObjectId,	// unique ID (auto-generated)
	name: String,							// product name (text)
	price: Number							// price (number)
});

// create model
module.exports = mongoose.model("Product", productSchema);