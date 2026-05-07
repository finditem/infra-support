import { useEffect, useState, type ImgHTMLAttributes, type SyntheticEvent } from "react";
import { cn } from "@/utils";

/**
 * 공통 아바타 컴포넌트입니다.
 *
 * @remarks
 * - 기본 크기는 `32x32`로 고정되어 있습니다.
 * - 이미지 로드 실패 시 `fallbackSrc`가 있으면 대체 이미지를 렌더링합니다.
 * - `onError` 콜백은 최종 로드 실패 시 호출됩니다.
 *
 * @author junyeol
 */

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  /** Avatar Image URL */
  src: string;
  /** 대체 텍스트 */
  alt: string;
  /** 이미지 로드 실패 시 사용할 대체 Avatar Image URL*/
  fallbackSrc?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * @example
 * ```tsx
 * <Avatar
 *  src="https://example.com/avatar.png"
 *  alt="카카오 공식 이미지"
 *  fallbackSrc="https://example.com/avatar-fallback.png"
 * />
 * ```
 */

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
