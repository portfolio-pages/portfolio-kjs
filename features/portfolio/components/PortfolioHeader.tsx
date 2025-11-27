"use client";

import { cn } from "@/shared/lib/utils";

interface PortfolioHeaderProps {
  title: string;
  createdAt: string;
  joinRole: string;
  className?: string;
}

export function PortfolioHeader({
  title,
  createdAt,
  joinRole,
  className,
}: PortfolioHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h1 className="text-3xl font-bold text-gray-900">
        {title}
      </h1>
      <div className="text-sm text-gray-900">
        Created at{" "}
        <span className="text-[lab(50.1%_30.1_-80.0)]">{createdAt}</span>
        {", joined as "}
        <span className="text-[lab(50.1%_30.1_-80.0)]">{joinRole}</span>
      </div>
    </div>
  );
}

