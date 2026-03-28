"use client";

import Image from "next/image";
import { Newspaper } from "lucide-react";
import { useState } from "react";

interface NewsFallbackImageProps {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
}

export function NewsFallbackImage({
  src,
  alt,
  fallbackSrc = "/images/black_woman.jpg",
  className = "object-cover",
  sizes,
  fill = true,
}: NewsFallbackImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const imageSrc = useFallback ? fallbackSrc : src;

  if (!imageSrc || fallbackFailed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F9FAFB] text-[#6B7280]">
        <Newspaper size={24} />
        <span className="text-xs font-medium">Image unavailable</span>
      </div>
    );
  }

  return (
    <>
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        unoptimized
        onError={() => {
          if (useFallback) {
            setFallbackFailed(true);
          } else {
            setUseFallback(true);
          }
        }}
      />
    </>
  );
}
