import classNames from "classnames";
import { User } from "lucide-react";
import { DetailedHTMLProps, HTMLAttributes } from "react";
interface AvatarProps {
  size?: string;
}
export const Avatar = (
  props: AvatarProps &
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) => {
  const { className: style } = props;
  return (
    <div
      {...props}
      className={classNames(
        "size-11 border border-[#960018] rounded-full flex justify-center items-center",
        style,
      )}
    >
      <User />
    </div>
  );
};
