import { ReactNode } from "react";

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-blue-500 text-white rounded ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
