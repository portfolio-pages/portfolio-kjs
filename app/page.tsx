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
  const [originalSections, setOriginalSections] = useState<SideBarSection[]>([]);
  const [sections, setSections] = useState<SideBarSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>();

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
        setOriginalSections(data);
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

  // 프로필 이미지 가져오기
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await fetch("/api/profile/image");
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile image");
        }
        
        const data = await response.json();
        setProfileImage(data.imageUrl || undefined);
      } catch (err) {
        console.error("Error fetching profile image:", err);
        // 에러가 발생해도 계속 진행 (프로필 이미지는 선택사항)
      }
    };

    fetchProfileImage();
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

  // videoId가 변경될 때마다 이미지 가져오기
  useEffect(() => {
    const fetchImages = async () => {
      if (!selectedItem?.videoId) {
        setImages([]);
        return;
      }

      try {
        setIsLoadingImages(true);
        const response = await fetch(`/api/portfolio/images/${selectedItem.videoId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        
        const imageList = await response.json();
        setImages(imageList);
      } catch (err) {
        console.error("Error fetching images:", err);
        setImages([]);
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchImages();
  }, [selectedItem?.videoId]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // 검색 쿼리에 따라 섹션 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      // 검색어가 없으면 원본 데이터 표시
      setSections(originalSections);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    
    // 각 섹션의 아이템들을 필터링
    const filteredSections: SideBarSection[] = originalSections
      .map((section) => {
        // 제목 또는 해시태그에 검색어가 포함된 아이템만 필터링
        const filteredItems = section.items.filter((item) => {
          const titleMatch = item.title.toLowerCase().includes(query);
          const hashtagMatch = item.hashtags.some((tag) =>
            tag.toLowerCase().includes(query)
          );
          return titleMatch || hashtagMatch;
        });

        // 필터링된 아이템이 있는 경우에만 섹션 반환
        if (filteredItems.length > 0) {
          return {
            ...section,
            items: filteredItems,
            status: "opened" as "opened" | "closed", // 검색 결과는 자동으로 열림
          };
        }
        return null;
      })
      .filter((section): section is SideBarSection => section !== null);

    setSections(filteredSections);
  }, [searchQuery, originalSections]);

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
        profileImage={profileImage}
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
              {images.length > 0 && (
                <ContentBlock
                  title="Gallery"
                  subtitle="갤러리"
                >
                  <div className="rounded-lg p-6">
                    {isLoadingImages ? (
                      <p className="text-gray-400 text-center py-8">이미지 로딩 중...</p>
                    ) : (
                      <ImageGallery images={images} />
                    )}
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
