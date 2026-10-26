import classNames from "classnames";
import { User } from "lucide-react";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import Image from "next/image";
interface AvatarProps {
  size?: string;
  src?: string | null;
  /** Empty when the photo sits next to a name. Set when the image is the only label. */
  alt?: string;
}
export const Avatar = (
  props: AvatarProps &
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) => {
  const { className: style, src, alt = "", ...rest } = props;
  return (
    <div
      {...rest}
      className={classNames(
        "size-11 border border-[#960018] rounded-full flex justify-center items-center relative overflow-hidden",
        style,
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill sizes="44px" className="object-cover" />
      ) : (
        <User aria-hidden />
      )}
    </div>
  );
};
