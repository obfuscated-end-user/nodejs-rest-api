// think of this entire thing as like an interface in other languages
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({		// define schema (data rules)
	_id: mongoose.Schema.Types.ObjectId,	// unique ID (auto-generated)
	email: {
		type: String,	// user email (text)
		required: true,	// make this required
		unique: true,	// make this unique
		// validate this using a regular expression
		match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
	},
	password: {
		type: String,	// price (text)
		required: true	// make this required
	}
});

// create model
module.exports = mongoose.model("User", userSchema);