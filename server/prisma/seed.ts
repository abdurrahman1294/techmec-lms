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
  console.log(`Created: ${email} id=${user.id}`);
  return user;
}

async function main() {
  const admin = await upsertUser(
    "admin@mechspec.local",
    "System Administrator",
    "Admin@12345",
    "ADMINISTRATOR"
  );

  const instructor = await upsertUser(
    "instructor@mechspec.local",
    "John Instructor",
    "Instruct@12345",
    "INSTRUCTOR"
  );

  const student = await upsertUser(
    "student@mechspec.local",
    "Alice Student",
    "Student@2026Safe!",          //  strongr password
    "STUDENT"
  );

  //  COURSES 
  const course1 = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Introduction to Mechanical Design",
      description: "Learn the fundamentals of mechanical design, CAD basics, and engineering drawing standards.",
      category: "Mechanical Engineering",
      price: 49.99,
      isPublished: true,
      instructorId: instructor.id,
      thumbnailUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "Thermodynamics for Engineers",
      description: "Core concepts of thermodynamics, heat transfer, and energy systems with practical examples.",
      category: "Thermal Engineering",
      price: 59.99,
      isPublished: true,
      instructorId: instructor.id,
      thumbnailUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
    },
  });

  const course3 = await prisma.course.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: "Advanced Manufacturing Processes",
      description: "CNC machining, additive manufacturing, quality control, and modern production techniques.",
      category: "Manufacturing",
      price: 69.99,
      isPublished: true,
      instructorId: instructor.id,
      thumbnailUrl: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800",
    },
  });

  console.log("Courses ready:", course1.title, course2.title, course3.title);
  console.log("\n=== DEMO ACCOUNTS ===");
  console.log("ADMIN:      admin@mechspec.local / Admin@12345");
  console.log("INSTRUCTOR: instructor@mechspec.local / Instruct@12345");
  console.log("STUDENT:    student@mechspec.local / Student@2026Safe!");
  console.log("=====================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
