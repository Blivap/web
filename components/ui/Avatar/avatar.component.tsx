import classNames from "classnames";
import { User } from "lucide-react";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import Image from "next/image";
interface AvatarProps {
  size?: string;
  src?: string | null;
}
export const Avatar = (
  props: AvatarProps &
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) => {
  const { className: style, src } = props;
  return (
    <div
      {...props}
      className={classNames(
        "size-11 border border-[#960018] rounded-full flex justify-center items-center relative overflow-hidden",
        style,
      )}
    >
      {src ? (
        <Image src={src} alt="Avatar" fill className="object-cover" />
      ) : (
        <User />
      )}
    </div>
  );
};
