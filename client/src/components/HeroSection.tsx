import { useNavigate } from "react-router-dom";
import Button from "./Button";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        textAlign: "center",
        padding: "80px 20px",
        background:
          "linear-gradient(135deg, #1e293b, #2563eb)",
        color: "white",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          marginBottom: "20px",
        }}
      >
        Learn. Teach. Grow.
      </h1>

      <p
        style={{
          fontSize: "20px",
          maxWidth: "700px",
          margin: "0 auto 40px auto",
          lineHeight: "1.7",
        }}
      >
        Mech Spec LMS is a modern Learning Management
        System that empowers instructors to create
        courses and enables students to learn,
        enroll, and track their educational journey
        securely.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <Button
          text="Browse Courses"
          onClick={() => navigate("/courses")}
        />

        <Button
          text="Get Started"
          onClick={() => navigate("/register")}
        />
      </div>
    </section>
  );
}

export default HeroSection;