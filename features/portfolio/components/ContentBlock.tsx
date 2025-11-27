"use client";

import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface ContentBlockProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}

export function ContentBlock({
  title,
  subtitle,
  children,
  className,
}: ContentBlockProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-[0.25rem]">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <p className="text-sm font-medium text-gray-400">{subtitle}</p>
      </div>
      <div className="backdrop-blur-[60px]">{children}</div>
    </div>
  );
}

