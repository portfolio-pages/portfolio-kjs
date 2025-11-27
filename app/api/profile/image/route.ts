import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const profileDir = path.join(process.cwd(), "public", "profile");
    
    // profile 디렉토리 확인
    try {
      await fs.access(profileDir);
    } catch {
      // 디렉토리가 없으면 null 반환
      return NextResponse.json({ imageUrl: null });
    }

    // 디렉토리 내 파일 목록 가져오기
    const files = await fs.readdir(profileDir);
    
    // 이미지 파일 필터링
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);
    });

    if (imageFiles.length === 0) {
      return NextResponse.json({ imageUrl: null });
    }

    // 첫 번째 이미지 파일 반환 (여러 개가 있으면 첫 번째 것 사용)
    const imageUrl = `/profile/${imageFiles[0]}`;
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

