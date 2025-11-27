"use client";

import { useState } from "react";
import { SideBar, type SideBarSection } from "@/features/portfolio/components/SideBar";
import { PortfolioHeader } from "@/features/portfolio/components/PortfolioHeader";
import { ContentBlock } from "@/features/portfolio/components/ContentBlock";
import { ImageGallery } from "@/features/portfolio/components/ImageGallery";
import { VideoPlayer } from "@/features/video/components/VideoPlayer";
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
          videoId: "pf1.mp4",
          images: [
            "/images/너의 이름 청춘.00_00_03_15.Still001.jpg",
            "/images/너의 이름 청춘.00_00_07_13.Still002.jpg",
            "/images/너의 이름 청춘.00_00_09_09.Still003.jpg",
            "/images/너의 이름 청춘.00_00_19_10.Still004.jpg",
            "/images/너의 이름 청춘.00_00_20_00.Still005.jpg",
            "/images/너의 이름 청춘.00_00_26_06.Still006.jpg",
            "/images/너의 이름 청춘.00_00_29_20.Still007.jpg",
            "/images/너의 이름 청춘.00_00_55_04.Still008.jpg",
            "/images/너의 이름 청춘.00_01_04_11.Still009.jpg",
            "/images/너의 이름 청춘.00_01_06_22.Still010.jpg",
            "/images/너의 이름 청춘.00_01_34_02.Still011.jpg",
            "/images/너의 이름 청춘.00_01_36_12.Still012.jpg",
            "/images/너의 이름 청춘.00_01_38_08.Still013.jpg",
            "/images/너의 이름 청춘.00_01_45_11.Still014.jpg",
            "/images/너의 이름 청춘.00_01_52_02.Still015.jpg",
            "/images/너의 이름 청춘.00_01_57_11.Still016.jpg",
            "/images/너의 이름 청춘.00_02_08_10.Still017.jpg",
            "/images/너의 이름 청춘.00_02_27_14.Still018.jpg",
            "/images/너의 이름 청춘.00_02_28_23.Still019.jpg",
            "/images/너의 이름 청춘.00_02_34_15.Still020.jpg",
            "/images/너의 이름 청춘.00_02_36_04.Still021.jpg",
            "/images/너의 이름 청춘.00_02_38_08.Still022.jpg",
            "/images/너의 이름 청춘.00_02_47_14.Still023.jpg",
            "/images/너의 이름 청춘.00_02_51_16.Still024.jpg",
            "/images/너의 이름 청춘.00_03_12_18.Still025.jpg",
            "/images/너의 이름 청춘.00_03_36_01.Still026.jpg"
          ],
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
              {selectedItem.images && selectedItem.images.length > 0 && (
                <ContentBlock
                  title="Gallery"
                  subtitle="갤러리"
                >
                  <div className="rounded-lg p-6">
                    <ImageGallery images={selectedItem.images} />
                  </div>
                </ContentBlock>
              )}
              <ContentBlock
                title="Content"
                subtitle="작품 내용"
              >
                <div className="rounded-lg p-6">
                  {selectedItem.videoId ? (
                    <VideoPlayer videoId={selectedItem.videoId} />
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
