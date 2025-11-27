"use client";

import { useState, useEffect } from "react";
import { SideBar, type SideBarSection } from "@/features/portfolio/components/SideBar";
import { PortfolioHeader } from "@/features/portfolio/components/PortfolioHeader";
import { ContentBlock } from "@/features/portfolio/components/ContentBlock";
import { ImageGallery } from "@/features/portfolio/components/ImageGallery";
import { VideoPlayer } from "@/features/video/components/VideoPlayer";
import type { NavSectionItem } from "@/features/portfolio/components";

export default function Home() {
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sections, setSections] = useState<SideBarSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/portfolio/sections");
        
        if (!response.ok) {
          throw new Error("Failed to fetch sections");
        }
        
        const data = await response.json();
        setSections(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching sections:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSections();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fafafa]">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fafafa]">
        <div className="text-center">
          <p className="text-red-600 mb-2">에러 발생: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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
                {(isExpanded) => (
                  <div className="rounded-lg p-6">
                    {selectedItem.videoId ? (
                      <VideoPlayer
                        videoId={selectedItem.videoId}
                        isExpanded={isExpanded}
                      />
                    ) : (
                      <p className="text-gray-400">비디오가 없습니다.</p>
                    )}
                  </div>
                )}
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
