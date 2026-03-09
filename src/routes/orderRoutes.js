const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/order", orderController.createOrder);
router.get("/order/list", orderController.getAllOrders);
router.get("/order/:orderId", orderController.getOrderById);
module.exports = router;
