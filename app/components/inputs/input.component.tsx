import classNames from "classnames";
import {
  ChangeEventHandler,
  DetailedHTMLProps,
  FocusEventHandler,
  InputHTMLAttributes,
  useState,
} from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";

type InputProps = {
  name: string;
  placeholder?: string;
  error?: string;
  label?: string;
  value: string;
  type?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  labelClassName?: string;
  inputClassName?: string;
  containerClassName?: string;
} & DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
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
    labelClassName,
    inputClassName,
    containerClassName,
    ...rest
  } = props;
  return (
    <div
      className={classNames("flex flex-col gap-2 w-full", containerClassName)}
    >
      <p
        className={classNames(
          "text-[#9794AA] text-base font-medium",
          labelClassName,
        )}
      >
        {label}
      </p>
      <div className="grid gap-px">
        <div
          className={classNames(
            "flex items-center border border-[#66666659] rounded-md w-full px-4 gap-2",
            { "border-red-500": error },
          )}
        >
          <input
            className={classNames(
              "outline-none py-4 w-full text-base font-medium",
              inputClassName,
            )}
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
            {...rest}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setTogglePassword((prev) => !prev)}
              className="cursor-pointer"
            >
              {toggelePassword ? <BsEye size={24} /> : <BsEyeSlash size={16} />}
            </button>
          )}
        </div>
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </div>
  );
};
