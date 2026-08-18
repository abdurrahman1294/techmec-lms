import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  listUsers,
  updateUserStatus,
  getAdminStats,
  getSystemLogs,
  listTransactions,
} from "../controllers/admin.controller";

const router = Router();

router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  (_req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin!",
    });
  }
);

router.get(
  "/admin/users",
  authenticate,
  authorize("ADMIN"),
  listUsers
);

router.patch(
  "/admin/users/:id/status",
  authenticate,
  authorize("ADMIN"),
  updateUserStatus
);

router.get(
  "/admin/stats",
  authenticate,
  authorize("ADMIN"),
  getAdminStats
);

router.get(
  "/admin/logs",
  authenticate,
  authorize("ADMIN"),
  getSystemLogs
);

router.get(
  "/admin/transactions",
  authenticate,
  authorize("ADMIN"),
  listTransactions
);

export default router;

