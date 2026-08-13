import { Router } from "express";
import { handleAssistantQuery } from "../controllers/assistant.controller";

const router = Router();

// Public endpoint — platform FAQ support (no auth required for MVP demo)
router.post("/assistant", handleAssistantQuery);

export default router;
