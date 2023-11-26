import express from "express";
import { Controllers } from "../controllers/userController";

const router = express.Router();

router.post("/", Controllers.createUser);
router.get("/", Controllers.getAllUsers);
router.get("/:userId", Controllers.getUserById);
router.put("/:userId", Controllers.updateUser);
router.delete("/:userId", Controllers.deleteUser);
router.put("/:userId/orders", Controllers.addOrder);
router.get("/:userId/orders", Controllers.getAllOrders);
router.get("/:userId/orders/total-price", Controllers.calculateTotalPrice);

export default router;
