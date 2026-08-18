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
