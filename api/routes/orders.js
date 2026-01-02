const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const OrdersController = require("../controllers/orders");

/**
 * mongoose.Schema.find().exec().then().catch() is a common pattern you will see
 * https://mongoosejs.com/docs/api/query.html
 * 
 * If you're using Postman, you can do the steps provided to test the program.
 * Before doing anything, you need to log in first. (see api/routes/user.js)
 * 
 * 1. Method: GET
 * 2. URL: http://localhost:3000/orders
 * 3. Headers tab -> Add:
 * 		Key: Authorization
 * 		Value: Bearer <token>
 */
router.get("/", checkAuth, OrdersController.orders_get_all);

/**
 * 1. Method: GET
 * 2. URL: http://localhost:3000/orders/_id
 * 3. Headers tab -> Add:
 * 		Key: Authorization
 * 		Value: Bearer <token>
 */
router.get("/:orderId", checkAuth, OrdersController.orders_get_order);

/**
 * 1. Method: POST
 * 2. URL: http://localhost:3000/orders/
 * 3. Body tab -> select "raw", and enter:
 * {
 * 		"productId": "real-product-mongo-id", (get ID from GET /products)
 * 		"quantity": "number" (1, 2, 3...)
 * }
 * (see api/models/order.js)
 */
router.post("/", checkAuth, OrdersController.orders_create_order);

/**
 * 1. Method: DELETE
 * 2. URL: http://localhost:3000/orders/_id (no body needed)
 */
router.delete("/:orderId", checkAuth, OrdersController.orders_delete_order);

// export so other files can use this
module.exports = router;