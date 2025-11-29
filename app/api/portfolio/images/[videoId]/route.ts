import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    // URL 디코딩 처리 (특수문자가 포함된 경우)
    let decodedVideoId: string;
    try {
      decodedVideoId = decodeURIComponent(videoId);
    } catch {
      // 디코딩 실패 시 원본 사용
      decodedVideoId = videoId;
    }

    // 보안: 경로 탐색 공격 방지
    const sanitizedVideoId = path.basename(decodedVideoId);
    if (sanitizedVideoId !== decodedVideoId || decodedVideoId.includes("..") || decodedVideoId.includes("/")) {
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
      .map((file) => {
        // Next.js public 폴더는 원본 경로를 사용 (브라우저가 자동으로 인코딩 처리)
        // 단, 특수문자가 포함된 경우 URL 안전하게 처리
        return `/images/${sanitizedVideoId}/${file}`;
      });

    return NextResponse.json(imageFiles);
  } catch (error) {
    console.error("Error fetching images:", error);
    // 더 자세한 에러 정보 로깅
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return NextResponse.json(
      { error: "Failed to fetch images", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

