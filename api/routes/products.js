const express = require("express");
const router = express.Router();
const multer = require("multer");

const checkAuth = require("../middleware/check-auth");
const ProductsController = require("../controllers/products");

// can't find docs on this one
// https://expressjs.com/en/resources/middleware/multer.html
// https://github.com/expressjs/multer/tree/main
// DiskStorage configuration object
const storage = multer.diskStorage({
	destination:  function(req, file, cb) {
		// callback
		cb(null, "./uploads/");	// files go to uploads folder
	},
	filename: function(req, file, cb) {
		// cb(null, new Date().toISOString() + file.originalname);
		cb(null, Date.now() + file.originalname);	// 1703456789-original.jpg
	}
});
// file validation function
const fileFilter = (req, file, cb) => {
	// if jpeg or png file is passed
	if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		// accept the file
		cb(null, true);
	} else {
		// reject the file
		cb(null, false);
	}
}
// Multer middleware instance
const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 * 5	}, // only accept files below 5mb
	fileFilter: fileFilter
});

// something something .exec().then() returns a Promise, look up more on that
// https://mongoosejs.com/docs/api/query.html
// matches GET /products
router.get("/", ProductsController.products_get_all);
// matches POST /products
router.post("/", checkAuth, upload.single("productImage"),
	ProductsController.products_create_product);
// matches GET /products/id
// GET /products/507f1f77bcf86cd799439011 for example
router.get("/:productId", ProductsController.products_get_product);
// matches PATCH /products
router.patch("/:productId", checkAuth,
	ProductsController.products_update_product);
// matches DELETE /products/
router.delete("/:productId", checkAuth, ProductsController.products_delete);

module.exports = router;