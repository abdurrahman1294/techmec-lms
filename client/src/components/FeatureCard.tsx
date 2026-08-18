type FeatureCardProps = {
  title: string;
  description: string;
};

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: 18,
        maxWidth: 280,
        flex: "1 1 220px",
        textAlign: "left",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#0f172a" }}>
        {title}
      </h3>
      <p style={{ margin: 0, color: "#64748b", fontSize: 14, lineHeight: 1.55 }}>
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;
