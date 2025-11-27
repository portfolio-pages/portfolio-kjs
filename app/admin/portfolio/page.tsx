"use client";

import { useState, useEffect } from "react";

interface Section {
  id: string;
  name: string;
}

export default function AdminPortfolioPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [formData, setFormData] = useState({
    sectionId: "",
    title: "",
    hashtags: "",
    createdAt: "",
    joinRole: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch("/api/admin/sections");
        if (response.ok) {
          const data = await response.json();
          setSections(data);
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, sectionId: data[0].id }));
          }
        }
      } catch (error) {
        console.error("Error fetching sections:", error);
      } finally {
        setIsLoadingSections(false);
      }
    };

    fetchSections();
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
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">포트폴리오 추가</h1>

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
    </div>
  );
}

