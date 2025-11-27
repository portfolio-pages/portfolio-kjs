"use client";

import { IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/shared/lib/utils";

interface NavItemProps {
  title: string;
  hashtags: string[];
  isFocus?: boolean;
  onClick?: () => void;
}

export function NavItem({ title, hashtags, isFocus = false, onClick }: NavItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full px-4 py-3 rounded-lg cursor-pointer transition-all",
        "flex items-center justify-between gap-4",
        isFocus
          ? "bg-gray-100"
          : "hover:bg-gray-50"
      )}
    >
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm font-bold mb-1 truncate",
            isFocus ? "text-[lab(50.1%_30.1_-80.0)]" : "text-gray-900"
          )}
        >
          {title}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {hashtags.map((tag, index) => (
            <span key={index}>
              #{tag}
              {index < hashtags.length - 1 && " "}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0">
        <IconChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

