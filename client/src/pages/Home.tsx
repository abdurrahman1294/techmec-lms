import HeroSection from "../components/HeroSection";
import FeatureCard from "../components/FeatureCard";

function Home() {
  return (
    <div>
      <HeroSection />

      <section
        style={{
          maxWidth: "1100px",
          margin: "60px auto",
          padding: "0 20px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginBottom: "15px",
          }}
        >
          Why Choose Mech Spec LMS?
        </h2>

        <p
          style={{
            color: "#555",
            maxWidth: "700px",
            margin: "0 auto 40px auto",
            lineHeight: "1.7",
          }}
        >
          Mech Spec LMS is a modern learning management system built
          with React, TypeScript, Express, Prisma, and PostgreSQL. It
          provides secure authentication, course management, student
          enrollment, and role-based access control for administrators,
          instructors, and students.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <FeatureCard
            title="For Students"
            description="Browse available courses, enroll in learning programs, and manage your enrolled courses."
          />

          <FeatureCard
            title="For Instructors"
            description="Create, update, and manage courses while helping students learn effectively."
          />

          <FeatureCard
            title="Secure Platform"
            description="Built with JWT authentication, role-based authorization, Express, Prisma, and PostgreSQL."
          />
        </div>
      </section>
    </div>
  );
}

export default Home;