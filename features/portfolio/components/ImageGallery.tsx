"use client";

import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        이미지가 없습니다.
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4", className)}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
        >
          <Image
            src={image}
            alt={`Gallery image ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

