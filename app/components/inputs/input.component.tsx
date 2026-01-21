import classNames from "classnames";
import { ChangeEventHandler, FocusEventHandler, useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";

interface InputProps {
  name: string;
  placeholder?: string;
  error?: string;
  label?: string;
  value: string;
  type?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}
export const Input = (props: InputProps) => {
  const [toggelePassword, setTogglePassword] = useState(false);
  const {
    name,
    error,
    placeholder = "Input text",
    label,
    type = "text",
    value,
    onBlur,
    onChange,
  } = props;
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-[#9794AA] text-base font-medium">{label}</p>
      <div className="grid gap-px">
        <div
          className={classNames(
            "flex items-center border border-[#66666659] rounded-md w-full px-5 gap-3",
            { "border-red-500": error },
          )}
        >
          <input
            className="outline-none py-[19.5px]  w-full text-base font-medium"
            type={
              type === "password"
                ? toggelePassword
                  ? "text"
                  : "password"
                : type
            }
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setTogglePassword((prev) => !prev)}
              className="cursor-pointer"
            >
              {toggelePassword ? <BsEye size={24} /> : <BsEyeSlash size={24} />}
            </button>
          )}
        </div>
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </div>
  );
};
