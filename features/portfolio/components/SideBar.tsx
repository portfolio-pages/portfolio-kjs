"use client";

import { useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { SearchBlock } from "@/shared/components/SearchBlock";
import { NavSection } from "./NavSection";
import type { NavSectionItem } from "./NavSection";
import { cn } from "@/shared/lib/utils";

export interface SideBarSection {
  id: string;
  name: string;
  status: "closed" | "opened";
  items: NavSectionItem[];
}

interface SideBarProps {
  profileImage?: string;
  name: string;
  year: string | number;
  sections: SideBarSection[];
  selectedItemId?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSectionToggle?: (sectionId: string) => void;
  onItemClick?: (item: NavSectionItem) => void;
  className?: string;
}

export function SideBar({
  profileImage,
  name,
  year,
  sections,
  selectedItemId,
  searchQuery,
  onSearchChange,
  onSectionToggle,
  onItemClick,
  className,
}: SideBarProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "");

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleSectionToggle = (sectionId: string) => {
    onSectionToggle?.(sectionId);
  };

  return (
    <div
      className={cn(
        "w-64 h-screen flex flex-col",
        className
      )}
    >
      {/* Profile Card */}
      <div className="px-5 pt-5 pb-4">
        <ProfileCard profileImage={profileImage} name={name} year={year} />
      </div>

      {/* Search Block */}
      <div className="px-5 pb-4">
        <SearchBlock
          value={localSearchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-0">
          {sections.map((section) => (
            <NavSection
              key={section.id}
              sectionName={section.name}
              status={section.status}
              items={section.items}
              selectedItemId={selectedItemId}
              onSectionToggle={() => handleSectionToggle(section.id)}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

