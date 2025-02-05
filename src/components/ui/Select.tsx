interface SelectProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
  }
  
  const Select: React.FC<SelectProps> = ({ value, onChange, children }) => {
    return (
      <select value={value} onChange={onChange} className="border p-2 rounded w-full">
        {children}
      </select>
    );
  };
  
  export default Select;
  