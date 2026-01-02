const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user");
const checkAuth = require("../middleware/check-auth");

router.post("/signup", UserController.user_signup);
/**
 * If, for some reason you can't log in, go to your project on MongoDB, then go
 * to "Project Overview", and click "add IP address" or something similar.
 * URL should look like this: https://cloud.mongodb.com/v2/project_id#/overview
 * IP access list: https://cloud.mongodb.com/v2/project_id#/security/network/accessList
 * 
 * Method: POST
 * URL: http://localhost:3000/user/login
 * Body tab -> select "raw", and enter:
 * {
 * 		"email": "test@example.com",
 * 		"password": "test123"
 * }
 * and click send.
 * Copy the token value. Use this token to paste it into the Headers tab, inside
 * "Authorization", with the value "Bearer <token>".
 */
router.post("/login", UserController.user_login);

// 694b683f059970879b71002a
// you need this `checkAuth` here to prevent any rando from deleting users w/o
// logging in
router.delete("/:userId", checkAuth, UserController.user_delete);

module.exports = router;