import { useNavigate } from "react-router-dom";
import Button from "./Button";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        textAlign: "center",
        padding: "56px 24px",
        background: "#1e3a8a",
        color: "#ffffff",
        marginBottom: 28,
        borderRadius: 10,
      }}
    >
      <h1
        style={{
          fontSize: 34,
          marginBottom: 14,
          fontWeight: 700,
          color: "#ffffff",
        }}
      >
        Learn. Teach. Grow.
      </h1>
      <p
        style={{
          fontSize: 16,
          maxWidth: 520,
          margin: "0 auto 28px",
          lineHeight: 1.65,
          color: "#e2e8f0",
        }}
      >
        Mech Spec LMS helps instructors publish courses and students enrol,
        learn, and track progress.
      </p>
      <Button
        className="btn-on-dark"
        onClick={() => navigate("/courses")}
        text="Browse courses"
      />
    </section>
  );
}

export default HeroSection;
