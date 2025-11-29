import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string; fileName: string }> }
) {
  try {
    const { videoId, fileName } = await params;

    // URL 디코딩 처리
    let decodedVideoId: string;
    let decodedFileName: string;
    try {
      decodedVideoId = decodeURIComponent(videoId);
      decodedFileName = decodeURIComponent(fileName);
    } catch {
      decodedVideoId = videoId;
      decodedFileName = fileName;
    }

    // 보안: 경로 탐색 공격 방지
    const sanitizedVideoId = path.basename(decodedVideoId);
    const sanitizedFileName = path.basename(decodedFileName);
    
    if (
      sanitizedVideoId !== decodedVideoId ||
      sanitizedFileName !== decodedFileName ||
      decodedVideoId.includes("..") ||
      decodedVideoId.includes("/") ||
      decodedFileName.includes("..") ||
      decodedFileName.includes("/")
    ) {
      return new NextResponse("Invalid video ID or file name", { status: 400 });
    }

    // 이미지 파일 경로
    const imagePath = path.join(
      process.cwd(),
      "public",
      "images",
      sanitizedVideoId,
      sanitizedFileName
    );

    // 파일 존재 여부 확인
    try {
      await fs.access(imagePath);
    } catch {
      return new NextResponse("Image file not found", { status: 404 });
    }

    // 파일 읽기
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const ext = path.extname(sanitizedFileName).toLowerCase();

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
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

