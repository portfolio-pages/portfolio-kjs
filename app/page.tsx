"use client";

import { useState } from "react";
import { SideBar, type SideBarSection } from "@/features/portfolio/components/SideBar";
import type { NavSectionItem } from "@/features/portfolio/components";

export default function Home() {
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sections, setSections] = useState<SideBarSection[]>([
    {
      id: "section-a",
      name: "#섹션_A",
      status: "opened",
      items: [
        {
          id: "1",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "2",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "3",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "4",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "5",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
      ],
    },
    {
      id: "section-b",
      name: "#섹션_B",
      status: "closed",
      items: [
        {
          id: "1",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "2",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "3",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "4",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "5",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
      ]
    },
    {
      id: "section-c",
      name: "#섹션_C",
      status: "closed",
      items: [
        {
          id: "1",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "2",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "3",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "4",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
        {
          id: "5",
          title: "겁나게_기깔나는_포폴_이름",
          hashtags: ["HASHTAG_1", "HASHTAG_2", "HASHTAG_3"],
        },
      ]
    },
  ]);

  const handleSectionToggle = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              status: section.status === "opened" ? "closed" : "opened",
            }
          : section
      )
    );
  };

  const handleItemClick = (item: NavSectionItem) => {
    setSelectedItemId(item.id);
    // TODO: 메인 콘텐츠 영역에 선택된 아이템 표시
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // TODO: 검색 기능 구현
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      {/* SideBar */}
      <SideBar
        name="Jinseo Kim"
        year="2025"
        sections={sections}
        selectedItemId={selectedItemId}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSectionToggle={handleSectionToggle}
        onItemClick={handleItemClick}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            포트폴리오 비디오
          </h1>
          <p className="text-gray-600">
            {selectedItemId
              ? `선택된 아이템: ${selectedItemId}`
              : "왼쪽 사이드바에서 포트폴리오를 선택하세요."}
          </p>
        </div>
      </main>
    </div>
  );
}
