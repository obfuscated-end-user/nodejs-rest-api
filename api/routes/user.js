const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user");
const checkAuth = require("../middleware/check-auth");

/**
 * If, for some reason you can't log in, go to your project on MongoDB, then go
 * to "Project Overview", and click "add IP address" or something similar.
 * URL should look like this: https://cloud.mongodb.com/v2/project_id#/overview
 * IP access list: https://cloud.mongodb.com/v2/project_id#/security/network/accessList
 * 
 * 1. Method: POST
 * 2. URL: http://localhost:3000/user/signup
 * 3. Body tab -> select "raw" -> JSON:
 * {
 * 		"email": "test@example.com",
 * 		"password": "test123"
 * }
 */
router.post("/signup", UserController.user_signup);

/**
 * 1. Method: POST
 * 2. URL: http://localhost:3000/user/login
 * 3. Body tab -> select "raw", and enter:
 * {
 * 		"email": "test@example.com",
 * 		"password": "test123"
 * }
 * 4. Copy the token value. Use this token to paste it into the Headers tab,
 * inside "Authorization", with the value "Bearer <token>".
 */
router.post("/login", UserController.user_login);

/**
 * You need this `checkAuth` here to prevent any rando from deleting users w/o
 * logging in.
 * 
 * 1. Method: DELETE (no body needed)
 * 2. URL: http://localhost:3000/user/507f1f77bcf86cd799439011
 * 		(use YOUR actual MongoDB user ID)
 * 3. Headers tab -> Add:
 * 		Key: Authorization
 * 		Value: Bearer <token>
 * 4. Send, deletes the user account.
 */
router.delete("/:userId", checkAuth, UserController.user_delete);

module.exports = router;