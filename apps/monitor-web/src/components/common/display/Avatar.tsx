import { useEffect, useState, type ImgHTMLAttributes, type SyntheticEvent } from "react";
import { cn } from "@/utils";

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

const Avatar = ({ src, alt, fallbackSrc, className, ...props }: AvatarProps) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      return;
    }
    props.onError?.(e);
  };

  return (
    <img
      alt={alt}
      className={cn("rounded-full object-cover", className)}
      height={32}
      src={imgSrc}
      width={32}
      onError={handleError}
      {...props}
    />
  );
};

export default Avatar;
