import "./Button.css";

type ButtonProps = {
  text?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
};

function Button({
  text,
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      className={`primary-button ${className}`.trim()}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children ?? text}
    </button>
  );
}

export default Button;
