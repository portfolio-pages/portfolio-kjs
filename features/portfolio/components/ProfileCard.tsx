"use client";

import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface ProfileCardProps {
  profileImage?: string;
  name: string;
  year: string | number;
  className?: string;
}

export function ProfileCard({
  profileImage,
  name,
  year,
  className,
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        "w-full h-fit rounded-[24px] px-4 py-4",
        "flex items-center gap-3",
        "bg-[#f5f5f5]",
        className
      )}
    >
      {profileImage ? (
        <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={profileImage}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200" />
      )}
      <div className="flex flex-col justify-center min-w-0 flex-1 gap-2">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          Portfolio
        </h1>
        <div className="flex gap-4">
          <span className="text-[12px] text-gray-900 leading-tight">{name}</span>
          <span className="text-[12px] text-gray-900 leading-tight">{year}</span>
        </div>
      </div>
    </div>
  );
}

