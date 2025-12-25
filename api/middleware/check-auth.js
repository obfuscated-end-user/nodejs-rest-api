const jwt = require("jsonwebtoken");

// this intercepts incoming requests, verifies a JWT token from the authorization header, and either grants acceses or blocks unauthorized requests
module.exports = (req, res, next) => {
	try {
		// in postman, you go on headers and put in
		// Authorization - Bearer tokenString
		// token string is like "Bearer fh875hg4897gthnv8wr7vh9wer87vhv8wtrvh..."
		const token = req.headers.authorization.split(" ")[1];
		// check the token's signature against a secret key
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		req.userData = decoded;
		next();
	} catch (error) {
		return res.status(401).json({
			message: "Auth failed"
		});
	}
};