'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type ImageWithFallbackProps = Omit<ImageProps, 'alt'> & {
  alt: string;
  fallbackSrc?: string;
  hideOnError?: boolean;
};

export default function ImageWithFallback({
  alt,
  fallbackSrc,
  hideOnError = false,
  style,
  ...props
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (hideOnError && failed) {
    return null;
  }

  const src = failed && fallbackSrc ? fallbackSrc : props.src;

  return (
    <Image
      {...props}
      alt={alt}
      src={src}
      style={failed && !fallbackSrc ? { ...style, display: 'none' } : style}
      onError={() => setFailed(true)}
    />
  );
}
