import { Router } from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  checkout,
} from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/cart",
  authenticate,
  authorize("STUDENT"),
  getCart
);

router.post(
  "/cart",
  authenticate,
  authorize("STUDENT"),
  addToCart
);

router.delete(
  "/cart/:courseId",
  authenticate,
  authorize("STUDENT"),
  removeFromCart
);

router.post(
  "/cart/checkout",
  authenticate,
  authorize("STUDENT"),
  checkout
);

export default router;
