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
      return new NextResponse("Profile image not found", { status: 404 });
    }

    // 디렉토리 내 파일 목록 가져오기
    const files = await fs.readdir(profileDir);
    
    // 이미지 파일 필터링
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);
    });

    if (imageFiles.length === 0) {
      return new NextResponse("Profile image not found", { status: 404 });
    }

    // 첫 번째 이미지 파일 반환
    const imageFileName = imageFiles[0];
    const imagePath = path.join(profileDir, imageFileName);
    
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const ext = path.extname(imageFileName).toLowerCase();
      
      // Content-Type 결정
      const contentTypeMap: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
      };
      
      const contentType = contentTypeMap[ext] || "image/jpeg";
      
      return new NextResponse(imageBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      console.error("Error reading image file:", error);
      return new NextResponse("Failed to read image file", { status: 500 });
    }
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

