"use client";

import { useState } from "react";
import { SideBar, type SideBarSection } from "@/features/portfolio/components/SideBar";
import { PortfolioHeader } from "@/features/portfolio/components/PortfolioHeader";
import { ContentBlock } from "@/features/portfolio/components/ContentBlock";
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
          createdAt: "Nov 25, 2025",
          joinRole: "Developer",
          description: "이 작품은 매우 기깔나는 포트폴리오입니다.",
          videoId: "video-1",
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
  };

  // 선택된 아이템 찾기
  const selectedItem = sections
    .flatMap((section) => section.items)
    .find((item) => item.id === selectedItemId);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // TODO: 검색 기능 구현
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa] px-4 py-4 box-border">
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
      <main className="flex-1 overflow-y-auto bg-[#fafafa] relative">
        <div className="p-8 relative z-10">
          {selectedItem ? (
            <div className="flex flex-col gap-8">
              <PortfolioHeader
                title={selectedItem.title}
                createdAt={selectedItem.createdAt || "N/A"}
                joinRole={selectedItem.joinRole || "N/A"}
              />
              
              <ContentBlock
                title="Description"
                subtitle="작품 소개"
              >
                <div className="rounded-lg bg-white p-6 min-h-[200px]">
                  {selectedItem.description || (
                    <p className="text-gray-400">설명이 없습니다.</p>
                  )}
                </div>
              </ContentBlock>

              <ContentBlock
                title="Content"
                subtitle="작품 내용"
              >
                <div className="rounded-lg p-6">
                  {selectedItem.videoId ? (
                    <p className="text-gray-400">비디오 ID: {selectedItem.videoId}</p>
                  ) : (
                    <p className="text-gray-400">비디오가 없습니다.</p>
                  )}
                </div>
              </ContentBlock>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">
                왼쪽 사이드바에서 포트폴리오를 선택하세요.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
