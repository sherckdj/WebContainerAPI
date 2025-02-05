import { ReactNode } from "react";

interface LabelProps {
  children: ReactNode;
}

const Label: React.FC<LabelProps> = ({ children }) => {
  return <label className="block font-medium mb-1">{children}</label>;
};

export default Label;
