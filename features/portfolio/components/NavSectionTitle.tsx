"use client";

import { IconChevronRight, IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/shared/lib/utils";

interface NavSectionTitleProps {
  sectionName: string;
  status: "closed" | "opened";
  onClick?: () => void;
}

export function NavSectionTitle({ sectionName, status, onClick }: NavSectionTitleProps) {
  const isOpened = status === "opened";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors",
        isOpened && "bg-[#f5f5f5]"
      )}
    >
      {isOpened ? (
        <IconChevronDown className="w-4 h-4 text-gray-900" />
      ) : (
        <IconChevronRight className="w-4 h-4 text-gray-500" />
      )}
      <span
        className={cn(
          "text-sm transition-colors",
          isOpened ? "font-semibold text-gray-900" : "font-normal text-gray-500"
        )}
      >
        {sectionName}
      </span>
    </div>
  );
}

