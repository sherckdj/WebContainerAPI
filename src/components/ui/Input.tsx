interface InputProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
  }
  
  const Input: React.FC<InputProps> = ({ value, onChange, placeholder = "", type = "text" }) => {
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border p-2 rounded w-full"
      />
    );
  };
  
  export default Input;
  