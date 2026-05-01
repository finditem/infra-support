import { type SyntheticEvent, type ImgHTMLAttributes } from "react";

/**
 *  공통 이미지 컴포넌트입니다.
 *
 * @remarks
 * - 기본 로딩 전략은 `lazy`입니다. 필요에 따라 `eager`로 변경할 수 있습니다.
 * - 이미지 로드 실패 시 `fallbackSrc`가 있으면 대체 이미지를 렌더링합니다.
 * - `onError` 콜백은 이미지 로드 실패 시 호출됩니다. `fallbackSrc`가 없는 경우에만 호출됩니다.
 *
 * @author junyeol
 */

interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "width" | "height"
> {
  /** Image URL */
  src: string;
  /** 대체 텍스트 (장식용 이미지는 빈 문자열 허용) */
  alt: string;
  /** 이미지 너비(px) */
  width: number;
  /** 이미지 높이(px) */
  height: number;
  /** 추가 클래스명 */
  className?: string;
  /** 로딩 전략 (default: `"lazy"`) */
  loading?: "lazy" | "eager";
  /** 이미지 로드실패 시 사용할 대체 Image URL */
  fallbackSrc?: string;
  /** 최종 로드 실패 시 호출되는 콜백 */
  onError?: () => void;
}

/**
 * @example
 * ```tsx
 * // 기본 사용
 * <Image
 *  src="https://example.com/avatar.png"
 *  alt="사용자 아바타"
 *  width={40}
 *  height={40}
 *  className="rounded-full object-cover"
 *  fallbackSrc="https://example.com/avatar-fallback.png"
 * />
 * ```
 */

const Image = ({
  alt,
  className,
  height,
  loading = "lazy",
  src,
  width,
  fallbackSrc,
  onError,
}: ImageProps) => {
  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
      return;
    }
    onError?.();
  };

  return (
    <img
      alt={alt}
      className={className}
      height={height}
      loading={loading}
      src={src}
      width={width}
      onError={handleError}
    />
  );
};

export default Image;
