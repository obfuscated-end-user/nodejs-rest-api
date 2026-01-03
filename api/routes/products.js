const express = require("express");
const router = express.Router();
const multer = require("multer");

const checkAuth = require("../middleware/check-auth");
const ProductsController = require("../controllers/products");

/**
 * Can't find docs on this one:
 * https://expressjs.com/en/resources/middleware/multer.html
 * https://github.com/expressjs/multer/tree/main
 * DiskStorage configuration object.
 */
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

/**
 * If you're using Postman, you can do the steps provided to test the program.
 * Make sure you're logged in before doing anything. (see api/routes/user.js)
 * 
 * something something .exec().then() returns a Promise, look up more on that
 * https://mongoosejs.com/docs/api/query.html
 * 
 * 1. Method: GET
 * 2. URL: http://localhost:3000/products (no body/headers needed)
 * 3. Send, this returns all products with image paths.
 */
router.get("/", ProductsController.products_get_all);
/**
 * 1. Method: GET
 * 2. URL: http://localhost:3000/products/507f1f77bcf86cd799439011 (use real MongoDB ID from GET /products response)
 * 3. Send, this returns one product.
 */
router.get("/:productId", ProductsController.products_get_product);
/**
 * 1. Method: POST
 * 2. URL: http://localhost:3000/products/
 * 3. Headers tab -> Add:
 * 		Key: Authorization
 * 		Value: Bearer <token>
 * 4. Body tab -> select "form-data" (NOT "raw", but you can probably do that too)
 * 5. Add these fields (with the values you want):
 * 		KEY				| TYPE	| VALUE
 * 		name			| Text	| "product name string"
 * 		price			| Text	| 12.34
 * 		productImage	| File	| [SELECT JPG/PNG IMAGE]
 * 6. Send -> creates product and saves image to /uploads/.
 */
router.post("/", checkAuth, upload.single("productImage"),
	ProductsController.products_create_product);
/**
 * 1. Method: PATCH
 * 2. URL: http://localhost:3000/products/507f1f77bcf86cd799439011
 * 3. Headers: Authorization: Bearer <TOKEN>
 * 4. Body tab -> select "raw" -> JSON:
 * [	<- SQUARE BRACKETS!
 * 		{ "propName": "name", "value": "updated name" },
 * 		{ "propName": "price", "value": "56.78" }
 * ]
 */
router.patch("/:productId", checkAuth,
	ProductsController.products_update_product);
/**
 * 1. Method: DELETE (no body needed)
 * 2. URL: http://localhost:3000/products/507f1f77bcf86cd799439011
 * 3. Headers tab -> Add:
 * 		Key: Authorization
 * 		Value: Bearer <token>
 * 4. Send, this Deletes product, and image stays in /uploads/.
 */
router.delete("/:productId", checkAuth, ProductsController.products_delete);

module.exports = router;