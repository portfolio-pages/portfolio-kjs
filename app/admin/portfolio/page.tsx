"use client";

import { useState, useEffect } from "react";
import type { SideBarSection, NavSectionItem } from "@/features/portfolio/components/SideBar";

interface Section {
  id: string;
  name: string;
}

export default function AdminPortfolioPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [allSections, setAllSections] = useState<SideBarSection[]>([]);
  const [formData, setFormData] = useState({
    sectionId: "",
    title: "",
    hashtags: "",
    createdAt: "",
    joinRole: "",
    description: "",
  });
  const [newSectionName, setNewSectionName] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSections = async () => {
    try {
      const response = await fetch("/api/admin/sections");
      if (response.ok) {
        const data = await response.json();
        setSections(data);
        if (data.length > 0 && !formData.sectionId) {
          setFormData((prev) => ({ ...prev, sectionId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setIsLoadingSections(false);
    }
  };

  const fetchAllSections = async () => {
    try {
      const response = await fetch("/api/portfolio/sections");
      if (response.ok) {
        const data = await response.json();
        setAllSections(data);
      }
    } catch (error) {
      console.error("Error fetching all sections:", error);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchAllSections();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const submitFormData = new FormData();
      submitFormData.append("sectionId", formData.sectionId);
      submitFormData.append("title", formData.title);
      submitFormData.append("hashtags", formData.hashtags);
      if (formData.createdAt) submitFormData.append("createdAt", formData.createdAt);
      if (formData.joinRole) submitFormData.append("joinRole", formData.joinRole);
      if (formData.description) submitFormData.append("description", formData.description);
      if (videoFile) submitFormData.append("video", videoFile);
      imageFiles.forEach((file) => {
        submitFormData.append("images", file);
      });

      const response = await fetch("/api/admin/portfolio", {
        method: "POST",
        body: submitFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add portfolio");
      }

      setMessage({ type: "success", text: "포트폴리오가 성공적으로 추가되었습니다!" });
      
      // 폼 초기화
      setFormData({
        sectionId: sections.length > 0 ? sections[0].id : "",
        title: "",
        hashtags: "",
        createdAt: "",
        joinRole: "",
        description: "",
      });
      setVideoFile(null);
      setImageFiles([]);
      
      // 목록 새로고침
      fetchAllSections();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    setIsAddingSection(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newSectionName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add section");
      }

      setMessage({ type: "success", text: "섹션이 성공적으로 추가되었습니다!" });
      setNewSectionName("");
      fetchSections();
      fetchAllSections();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsAddingSection(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("정말로 이 포트폴리오를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/portfolio/${itemId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete portfolio");
      }

      setMessage({ type: "success", text: "포트폴리오가 성공적으로 삭제되었습니다!" });
      fetchAllSections();
      fetchSections();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    const section = allSections.find((s) => s.id === sectionId);
    const itemCount = section?.items.length || 0;
    
    const confirmMessage = itemCount > 0
      ? `정말로 이 섹션을 삭제하시겠습니까? 섹션 내의 ${itemCount}개의 포트폴리오와 관련 파일들도 모두 삭제됩니다.`
      : "정말로 이 섹션을 삭제하시겠습니까?";

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/sections/${sectionId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete section");
      }

      setMessage({ type: "success", text: "섹션이 성공적으로 삭제되었습니다!" });
      fetchAllSections();
      fetchSections();
      
      // 삭제된 섹션이 선택된 섹션이면 첫 번째 섹션으로 변경
      if (formData.sectionId === sectionId) {
        const updatedSections = sections.filter((s) => s.id !== sectionId);
        if (updatedSections.length > 0) {
          setFormData((prev) => ({ ...prev, sectionId: updatedSections[0].id }));
        } else {
          setFormData((prev) => ({ ...prev, sectionId: "" }));
        }
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">포트폴리오 관리</h1>

        {/* 섹션 추가 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">새 섹션 추가</h2>
          <form onSubmit={handleAddSection} className="flex gap-4">
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="섹션 이름 (예: 뮤직비디오)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={isAddingSection}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingSection ? "추가 중..." : "섹션 추가"}
            </button>
          </form>
        </div>

        {/* 메시지 */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 포트폴리오 추가 폼 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">포트폴리오 추가</h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* 섹션 선택 */}
          <div>
            <label htmlFor="sectionId" className="block text-sm font-medium text-gray-700 mb-2">
              섹션
            </label>
            {isLoadingSections ? (
              <p className="text-sm text-gray-500">섹션 로딩 중...</p>
            ) : (
              <select
                id="sectionId"
                name="sectionId"
                value={formData.sectionId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* 해시태그 */}
          <div>
            <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 mb-2">
              해시태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              id="hashtags"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleInputChange}
              placeholder="HASHTAG_1, HASHTAG_2, HASHTAG_3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 생성일 */}
          <div>
            <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700 mb-2">
              생성일
            </label>
            <input
              type="text"
              id="createdAt"
              name="createdAt"
              value={formData.createdAt}
              onChange={handleInputChange}
              placeholder="Nov 25, 2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 참여 역할 */}
          <div>
            <label htmlFor="joinRole" className="block text-sm font-medium text-gray-700 mb-2">
              참여 역할
            </label>
            <input
              type="text"
              id="joinRole"
              name="joinRole"
              value={formData.joinRole}
              onChange={handleInputChange}
              placeholder="촬영"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 비디오 파일 */}
          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
              비디오 파일
            </label>
            <input
              type="file"
              id="video"
              name="video"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {videoFile && (
              <p className="mt-2 text-sm text-gray-600">선택된 파일: {videoFile.name}</p>
            )}
          </div>

          {/* 이미지 파일들 */}
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
              이미지 파일들 (여러 개 선택 가능)
            </label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {imageFiles.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                선택된 파일: {imageFiles.length}개
              </p>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "처리 중..." : "포트폴리오 추가"}
          </button>
        </form>
        </div>

        {/* 섹션 목록 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">섹션 목록</h2>
          <div className="space-y-3">
            {sections.length === 0 ? (
              <p className="text-sm text-gray-500">섹션이 없습니다.</p>
            ) : (
              sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="font-medium text-gray-900">{section.name}</span>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    섹션 삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 포트폴리오 목록 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">포트폴리오 목록</h2>
          <div className="space-y-6">
            {allSections.map((section) => (
              <div key={section.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                </div>
                <div className="space-y-2">
                  {section.items.length === 0 ? (
                    <p className="text-sm text-gray-500">포트폴리오가 없습니다.</p>
                  ) : (
                    section.items.map((item: NavSectionItem) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          {item.videoId && (
                            <p className="text-sm text-gray-500">Video: {item.videoId}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

