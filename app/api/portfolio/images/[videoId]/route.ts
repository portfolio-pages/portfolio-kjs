import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    // 보안: 경로 탐색 공격 방지
    const sanitizedVideoId = path.basename(videoId);
    if (sanitizedVideoId !== videoId || videoId.includes("..") || videoId.includes("/")) {
      return NextResponse.json(
        { error: "Invalid video ID" },
        { status: 400 }
      );
    }

    // 이미지 디렉토리 경로
    const imagesDir = path.join(process.cwd(), "public", "images", sanitizedVideoId);

    try {
      // 디렉토리 존재 여부 확인
      await fs.access(imagesDir);
    } catch {
      // 디렉토리가 없으면 빈 배열 반환
      return NextResponse.json([]);
    }

    // 디렉토리 내 파일 목록 읽기
    const files = await fs.readdir(imagesDir);

    // 이미지 파일만 필터링 (jpg, jpeg, png, gif, webp 등)
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const imageFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .sort() // 파일명으로 정렬
      .map((file) => `/images/${sanitizedVideoId}/${file}`);

    return NextResponse.json(imageFiles);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

