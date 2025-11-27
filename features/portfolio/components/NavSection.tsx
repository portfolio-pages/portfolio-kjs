"use client";

import { NavSectionTitle } from "./NavSectionTitle";
import { NavItem } from "./NavItem";

export interface NavSectionItem {
  id: string;
  title: string;
  hashtags: string[];
  createdAt?: string;
  joinRole?: string;
  description?: string;
  videoId?: string;
  images?: string[];
}

interface NavSectionProps {
  sectionName: string;
  status: "closed" | "opened";
  items: NavSectionItem[];
  selectedItemId?: string;
  onSectionToggle?: () => void;
  onItemClick?: (item: NavSectionItem) => void;
}

export function NavSection({
  sectionName,
  status,
  items,
  selectedItemId,
  onSectionToggle,
  onItemClick,
}: NavSectionProps) {
  const isOpened = status === "opened";

  return (
    <div className="flex flex-col gap-4 px-5">
      <NavSectionTitle
        sectionName={sectionName}
        status={status}
        onClick={onSectionToggle}
      />
      {isOpened && (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <NavItem
              key={item.id}
              title={item.title}
              hashtags={item.hashtags}
              isFocus={item.id === selectedItemId}
              onClick={() => onItemClick?.(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

