interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: "lazy" | "eager";
  fallbackSrc?: string;
  onError?: () => void;
}

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
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
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
