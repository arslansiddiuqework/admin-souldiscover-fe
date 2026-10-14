"use client";

type AvatarImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

/**
 * Avatar media for admin user/profile images from remote hosts.
 */
export function AvatarImage({
  src,
  alt,
  className,
  width,
  height,
}: AvatarImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- dynamic remote avatar URLs
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
