/**
 * Showcase seed: Admin + sample Instructor + sample Student + one published course.
 * Run: npm run seed
 *
 * Defaults (override with env):
 *   admin@mechspec.local / Admin@12345
 *   instructor@mechspec.local / Instruct@12345
 *   student@mechspec.local / Student@12345
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function upsertUser(
  email: string,
  name: string,
  password: string,
  role: "ADMINISTRATOR" | "INSTRUCTOR" | "STUDENT"
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Exists: ${email} (id=${existing.id}, role=${existing.role})`);
    return existing;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role, status: "ACTIVE" },
  });
  console.log(`Created: ${email} / (see seed defaults) id=${user.id}`);
  return user;
}

async function main() {
  const admin = await upsertUser(
    process.env.SEED_ADMIN_EMAIL || "admin@mechspec.local",
    process.env.SEED_ADMIN_NAME || "System Administrator",
    process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
    "ADMINISTRATOR"
  );

  const instructor = await upsertUser(
    "instructor@mechspec.local",
    "Demo Instructor",
    "Instruct@12345",
    "INSTRUCTOR"
  );

  const student = await upsertUser(
    "student@mechspec.local",
    "Demo Student",
    "Student@12345",
    "STUDENT"
  );

  const existingCourse = await prisma.course.findFirst({
    where: {
      title: "Introduction to Mechanical Design",
      instructorId: instructor.id,
    },
  });

  if (!existingCourse) {
    const course = await prisma.course.create({
      data: {
        title: "Introduction to Mechanical Design",
        description:
          "A starter course covering design fundamentals, CAD basics, and workshop safety for Mech Spec trainees.",
        category: "Mechanical",
        price: 29.99,
        thumbnailUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
        learningObjectives: [
          "Explain the mechanical design process",
          "Identify basic CAD concepts",
          "Apply workshop safety practices",
        ],
        isPublished: true,
        instructorId: instructor.id,
        lessons: {
          create: [
            {
              title: "Welcome & Course Overview",
              content:
                "Welcome to Introduction to Mechanical Design. This lesson outlines the course goals, tools you will use, and how progress is tracked in the LMS.",
              sortOrder: 1,
            },
            {
              title: "Design Process Basics",
              content:
                "We walk through problem definition, requirements, concept generation, and evaluation. Keep notes—you will apply this process later.",
              sortOrder: 2,
            },
            {
              title: "Safety in the Workshop",
              content:
                "Personal protective equipment, machine zones, and reporting hazards. Safety is mandatory before any practical session.",
              sortOrder: 3,
            },
          ],
        },
      },
    });
    console.log(`Sample course created id=${course.id} (published, 3 lessons)`);
  } else {
    console.log(`Sample course already exists id=${existingCourse.id}`);
  }

  console.log("\n--- Demo accounts ---");
  console.log("ADMIN:      admin@mechspec.local / Admin@12345");
  console.log("INSTRUCTOR: instructor@mechspec.local / Instruct@12345");
  console.log("STUDENT:    student@mechspec.local / Student@12345");
  console.log("Change default passwords after first real deployment.");
  void admin;
  void student;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
