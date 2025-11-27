"use client";

import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/shared/lib/utils";

interface SearchBlockProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchBlock({
  placeholder = "포트폴리오 검색",
  value,
  onChange,
  className,
}: SearchBlockProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <IconSearch className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full h-10 px-4 pl-10",
            "bg-[#f5f5f5] border border-gray-200 rounded-full",
            "text-sm text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent",
            "transition-all select-text"
          )}
        />
      </div>
    </div>
  );
}

