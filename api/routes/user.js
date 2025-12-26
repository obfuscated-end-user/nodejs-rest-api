const express = require("express");
const router = express.Router();

const UserController = require("../controllers/user");
const checkAuth = require("../middleware/check-auth");

router.post("/signup", UserController.user_signup);
router.post("/login", UserController.user_login);

// 694b683f059970879b71002a
// you need this `checkAuth` here to prevent any rando from deleting users w/o
// logging in
router.delete("/:userId", checkAuth, UserController.user_delete);

module.exports = router;