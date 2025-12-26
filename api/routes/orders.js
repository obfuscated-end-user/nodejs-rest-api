const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const OrdersController = require("../controllers/orders");

// mongoose.Schema.find().exec().then().catch() is a common pattern you will see
// https://mongoosejs.com/docs/api/query.html
// matches GET /orders
router.get("/", checkAuth, OrdersController.orders_get_all);
// matches POST /orders
router.post("/", checkAuth, OrdersController.orders_create_order);
// matches /orders/id (anything)
router.get("/:orderId", checkAuth, OrdersController.orders_get_order);
// matches DELETE /orders/id (could be anything)
router.delete("/:orderId", checkAuth, OrdersController.orders_delete_order);

// export so other files can use this
module.exports = router;