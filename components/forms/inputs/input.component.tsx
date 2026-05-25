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
  error?: string | boolean;
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
          "text-xs font-medium text-[#9794AA] dark:text-slate-400",
          labelClassName,
        )}
      >
        {label}
      </p>
      <div className="grid gap-px">
        <div
          className={classNames(
            "flex w-full items-center gap-2 rounded-md border border-[#66666659] bg-white px-4 dark:border-white/12 dark:bg-[#111827]",
            { "border-red-500": error },
          )}
        >
          <input
            className={classNames(
              "w-full bg-transparent py-2.5 text-base font-medium text-[#100F14] outline-none placeholder:text-xs placeholder:text-[#9794AA] dark:text-white dark:placeholder:text-slate-500",
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
              className="cursor-pointer text-[#6B7280] transition-colors dark:text-slate-400"
            >
              {toggelePassword ? <BsEye size={16} /> : <BsEyeSlash size={16} />}
            </button>
          )}
        </div>
        {error && <span className="text-red-500 text-[10px]">{error}</span>}
      </div>
    </div>
  );
};
