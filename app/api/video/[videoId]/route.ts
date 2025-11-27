import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    // 보안: 경로 탐색 공격 방지 (../, / 등 제거)
    const sanitizedFileName = path.basename(videoId);
    if (sanitizedFileName !== videoId || videoId.includes("..") || videoId.includes("/")) {
      return new NextResponse("Invalid video ID", { status: 400 });
    }

    // 파일 경로 구성 (public/videos/ 디렉토리)
    const videoPath = path.join(process.cwd(), "public", "videos", sanitizedFileName);

    // 파일 존재 여부 확인
    try {
      console.log(videoPath);
      await fs.access(videoPath);
    } catch {
      return new NextResponse("Video file not found", { status: 404 });
    }

    const fileStat = await fs.stat(videoPath);
    const fileSize = fileStat.size;
    const range = request.headers.get("range");

    if (range) {
      // Range 요청 처리 (스트리밍)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = await fs.readFile(videoPath);
      const chunk = file.slice(start, end + 1);

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": "video/mp4",
      };

      return new NextResponse(chunk, {
        status: 206,
        headers,
      });
    } else {
      // 전체 파일 반환
      const file = await fs.readFile(videoPath);
      const headers = {
        "Content-Length": fileSize.toString(),
        "Content-Type": "video/mp4",
      };

      return new NextResponse(file, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    console.error("Error serving video:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

