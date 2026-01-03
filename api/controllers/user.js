const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.user_signup = (req, res, next) => {
	User.find({ email: req.body.email })
		.exec()
		.then(user => {
			/**
			 * This could've been phrased better, but who cares.
			 * When you query `find()` and try checking `user`, it will be an
			 * empty array if you don't find entriesm and that, for some reason
			 * isn't null. Is this a JavaScript thing?
			 * So we check its length instead, if there is at least 1, then it
			 * means that at least 1 user is already using this email and
			 * therefore, don't proceed any further.
			 */
			if (user.length >= 1) {
				/**
				 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409
				 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422
				 */
				return res.status(409).json({
					message: "Email exists"
				});
			} else {
				/**
				 * https://github.com/kelektiv/node.bcrypt.js
				 * https://en.wikipedia.org/wiki/Salt_(cryptography)
				 * 10 salting rounds
				 */
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
}

exports.user_login = (req, res, next) => {
	// Mongoose find() always returns an array
	User.find({ email: req.body.email })
		.exec()
		.then(user => {
			// if email isn't found, user array has nothing in it
			if (user.length < 1) {
				return res.status(401).json({
					message: "Auth failed"
				});
			}
			/**
			 * Get plaintext user password from requests body and compare it
			 * to the hashed password from the database.
			 * `user[0]` because `find()` returns an array (first match).
			 */
			bcrypt.compare(
				req.body.password, user[0].password, (err, result) => {
				if (err) {
					return res.status(401).json({
						message: "Auth failed"
					});
				}
				if (result) {
					/**
					 * Create JWT with payload, generate token only on success.
					 * https://jwt.io - paste the token there to "decode" it
					 */
					const token = jwt.sign({
						email: user[0].email,
						userId: user[0]._id
					}, process.env.JWT_KEY, {	// signed with this secret key
						expiresIn: "1h"			// expires in 1 hour
					});
					return res.status(200).json({
						message: "Auth successful",
						token: token			// show this to the user
					})
				}
				res.status(401).json({
					message: "Auth failed"
				});
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({
				error: err
			});
		});
};

exports.user_delete = (req, res, next) => {
	// User.remove() is deprecated and guy in comments suggested this instead
	// MongoDB "delete where _id = id"
	User.deleteOne({ _id: req.params.userId })
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
};