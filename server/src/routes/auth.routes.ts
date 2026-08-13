import { Router, Request, Response } from "express";
import { register, login } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { writeSystemLog } from "../utils/systemLog";

const router = Router();

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

router.post("/register", register);
router.post("/login", login);

/**
 * Logout: records USER_LOGOUT in SystemLog and relies on the client
 * discarding the JWT. JWTs are stateless — this endpoint does NOT
 * revoke tokens server-side. Token expiry (1d) limits residual risk.
 * Refresh-token / denylist is a future enhancement.
 */
router.post(
  "/logout",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    if (req.user) {
      await writeSystemLog("USER_LOGOUT", {
        userId: req.user.id,
      });
    }
    res.json({
      success: true,
      message: "Logged out successfully.",
    });
  }
);

export default router;
