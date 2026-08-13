import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../utils/responses";

/**
 * Platform-support FAQ assistant (MVP).
 * Controlled knowledge base — no external API key required.
 */

const FAQ: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["register", "sign up", "signup", "create account"],
    answer:
      "To register: go to the Register page, enter your name, email, password, and choose Student or Instructor. Administrator accounts cannot be created via public registration — they are provisioned by the system. Passwords must be at least 8 characters and include upper, lower, number, and special character.",
  },
  {
    keywords: ["login", "log in", "sign in"],
    answer:
      "To log in: open the Login page, enter the email and password you registered with, then click Login. You will receive a JWT session token stored in your browser.",
  },
  {
    keywords: ["logout", "log out", "sign out"],
    answer:
      "Click the Logout button in the top navigation. This clears your local session token.",
  },
  {
    keywords: ["password", "forgot", "reset"],
    answer:
      "Password reset is not fully implemented in this MVP. Contact an administrator if you need your account unlocked. When registering, choose a strong password (8+ chars, upper, lower, number, special).",
  },
  {
    keywords: ["create course", "upload course", "new course"],
    answer:
      "Instructors and Administrators can create courses from the Courses page. Fill in title, description, category, price, learning objectives, optional thumbnail URL, and choose whether to publish. Then add lessons under the course.",
  },
  {
    keywords: ["publish", "unpublish"],
    answer:
      "When creating or editing a course, set the Published checkbox. Only published courses appear in the student catalogue and can be added to the cart.",
  },
  {
    keywords: ["lesson", "module", "add lesson"],
    answer:
      "After creating a course, open it and use the lesson form to add lessons. Order is assigned automatically (sortOrder). You can edit or delete lessons you own.",
  },
  {
    keywords: ["purchase", "buy", "cart", "checkout", "payment"],
    answer:
      "Students browse published courses, click Add to Cart, open the Cart page, then Checkout. Payment is simulated — no real card numbers are collected. After checkout a Transaction and Enrollment are created and you gain access under My Courses.",
  },
  {
    keywords: ["my courses", "enrolled", "access course"],
    answer:
      "After purchasing (or being enrolled), open My Courses from the navigation. Click a course to open the learning page where you can view lessons and mark them complete.",
  },
  {
    keywords: ["complete", "progress", "mark complete"],
    answer:
      "On the course learning page, click Mark Complete next to a lesson. The system updates completedLessons and recalculates progressPercent (completed / total lessons × 100).",
  },
  {
    keywords: ["dashboard"],
    answer:
      "The Dashboard shows role-specific stats: Students see enrolled course count; Instructors see their courses and enrollments; Administrators see platform totals (users, courses, enrollments, transactions).",
  },
  {
    keywords: ["instructor", "what can instructor"],
    answer:
      "Instructors can: create and edit their own courses, add/edit/delete lessons, publish/unpublish, view enrolled students for their courses, and see instructor dashboard statistics.",
  },
  {
    keywords: ["admin", "administrator", "what can admin"],
    answer:
      "Administrators can: manage all users (view, suspend, activate), manage all courses (edit/remove inappropriate ones), assign an instructor when creating a course, view platform statistics and system logs. Admin accounts are seeded/provisioned, not self-registered.",
  },
  {
    keywords: ["student", "what can student"],
    answer:
      "Students can: register/login, browse published courses, view details, add to cart, checkout (simulated payment), access enrolled courses, mark lessons complete, and track progress.",
  },
  {
    keywords: ["suspend", "activate", "banned"],
    answer:
      "Administrators can suspend or activate users from the Admin Users page. Suspended users cannot log in. Instructors and students cannot change user status.",
  },
  {
    keywords: ["thumbnail", "image"],
    answer:
      "When creating or editing a course you can provide a thumbnail URL (any publicly reachable image URL). File upload to object storage is a future roadmap item.",
  },
  {
    keywords: ["help", "support", "hello", "hi"],
    answer:
      "I am the Mech Spec LMS platform support assistant. Ask me how to register, log in, create or publish a course, purchase a course, mark lessons complete, or what each role can do.",
  },
];

function findAnswer(prompt: string): string {
  const lower = prompt.toLowerCase();
  let best: { score: number; answer: string } | null = null;

  for (const entry of FAQ) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: entry.answer };
    }
  }

  if (best) return best.answer;

  return (
    "I can only help with platform questions (registration, login, courses, cart, checkout, lessons, roles, dashboard). " +
    "Try asking: “How do I purchase a course?” or “How do I create a course?”"
  );
}

export const handleAssistantQuery = async (
  req: Request,
  res: Response
) => {
  try {
    const { prompt, message } = req.body;
    const text = String(prompt ?? message ?? "").trim();

    if (!text) {
      return errorResponse(res, 400, "Prompt is required.");
    }

    if (text.length > 1000) {
      return errorResponse(res, 400, "Prompt is too long.");
    }

    const reply = findAnswer(text);

    return successResponse(res, 200, "Assistant reply.", {
      reply,
    });
  } catch (error) {
    console.error("Assistant error:", error);
    return errorResponse(
      res,
      500,
      "Failed to process assistant query."
    );
  }
};
