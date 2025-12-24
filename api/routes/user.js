const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
	User.find({ email: req.body.email })
		.exec()
		.then(user => {
			// this could've been phrased better but who cares
			// when you query find() and try checking `user`, it will be an empty array if you don't find entries and that, for some reason isn't null
			// so we check its length instead, if there is at least 1, then it means that at least 1 user is already using this email and therefore don't proceed any further
			if (user.length >= 1) {
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422
				return res.status(409).json({
					message: "Email exists"
				});
			} else {
				// https://github.com/kelektiv/node.bcrypt.js
				// https://en.wikipedia.org/wiki/Salt_(cryptography)
				// 10 salting rounds
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if (err) {	// and do this if password fails
						return res.status(500).json({
							error: err
						});
					} else {	// else successful
						const user = new User({
							_id: new mongoose.Types.ObjectId(),
							email: req.body.email,
							password: hash
						});
						user.save()
							.then(result => {
								console.log(result);
								res.status(201).json({
									message: "User created"
								})
							})
							.catch(err => {
								console.log(err);
								res.status(500).json({
									error: err
								})
							});
					}
				});
			}
		})
});

// 694b683f059970879b71002a
router.delete("/:userId", (req, res, next) => {
	// User.remove() is deprecated and guy in comments suggested this instead
	User.deleteOne({ _id: req.params.userId })	// MongoDB "delete where _id = id"
		.exec()
		.then(result => {
			res.status(200).json({
				message: "User deleted",
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