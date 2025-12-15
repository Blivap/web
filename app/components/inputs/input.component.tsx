import { ChangeEventHandler, FocusEventHandler } from "react";

interface InputProps {
  name: string;
  placeholder?: string;
  error?: string;
  label?: string;
  value?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur: FocusEventHandler<HTMLInputElement>;
}
export const Input = (props: InputProps) => {
  const {
    name,
    error,
    placeholder = "Input text",
    label,
    value,
    onBlur,
    onChange,
  } = props;
  return (
    <div className="flex flex-col gap-[7px] w-full">
      <p className="text-[#666666] text-base">{label}</p>
      <div className="border border-[#66666659] rounded-xl w-full">
        <input
          className="outline-none py-4 px-2"
          type="text"
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </div>
  );
};
