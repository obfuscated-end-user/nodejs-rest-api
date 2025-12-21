const express = require("express");
const router = express.Router();

// Handle incoming GET requests to /orders
router.get("/", (req, res, next) => {	// matches GET /orders
	// 200 is a request succeeded
	res.status(200).json({				// sets status and sends JSON
		message: "Orders were fetched"	// browser gets this
	});
});

router.post("/", (req, res, next) => {	// matches POST /orders
	const order = {						// creates order object from request
		productId: req.body.productId,	// grab data from POST body
		quantity: req.body.quantity
	};
	// 201 indicates that the HTTP request has
	// led to the creation of a resource
	res.status(201).json({				// sends back success and order
		message: "Order was created",
		order: order
	});
});

router.get("/:orderId", (req, res, next) => {	// matches /orders/id (anything)
	res.status(200).json({				// sends back the id
		message: "Order details",
		orderId: req.params.orderId		// :orderId becomes req.params.orderId
	});
});

// matches DELETE /orders/id (could be anything)
// this doesn't delete anything at the moment, does the exact same thing as
// above but w/ a different verb/method
router.delete("/:orderId", (req, res, next) => {
	res.status(200).json({			// send a "success" message
		message: "Order deleted",
		orderId: req.params.orderId
	});
});

// export so other files can use this
module.exports = router;