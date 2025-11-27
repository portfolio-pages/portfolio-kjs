"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { cn } from "@/shared/lib/utils";

interface ContentBlockProps {
  title: string;
  subtitle: string;
  children: ReactNode | ((isExpanded: boolean) => ReactNode);
  className?: string;
  onExpandChange?: (isExpanded: boolean) => void;
}

export function ContentBlock({
  title,
  subtitle,
  children,
  className,
  onExpandChange,
}: ContentBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const maxHeight = window.innerHeight * 0.5;
        setNeedsExpansion(contentHeight > maxHeight);
      }
    };

    checkHeight();
    window.addEventListener("resize", checkHeight);
    return () => window.removeEventListener("resize", checkHeight);
  }, [isExpanded, children]);

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  const handleClick = () => {
    if (needsExpansion) {
      setIsExpanded((prev) => !prev);
    }
  };

  const renderChildren = () => {
    if (typeof children === "function") {
      return children(isExpanded);
    }
    return children;
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-[0.25rem]">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <p className="text-sm font-medium text-gray-400">{subtitle}</p>
      </div>
      <div
        className={cn(
          "bg-[#ffffff7a] backdrop-blur-[60px] rounded-2xl relative",
          needsExpansion && "cursor-pointer",
          !isExpanded && needsExpansion && "overflow-hidden"
        )}
        style={
          !isExpanded && needsExpansion
            ? { maxHeight: "50vh" }
            : undefined
        }
        onClick={handleClick}
      >
        <div ref={contentRef}>{renderChildren()}</div>
        {needsExpansion && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fafafa] to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
}

