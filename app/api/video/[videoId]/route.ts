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
    const sanitizedVideoId = path.basename(videoId);
    if (sanitizedVideoId !== videoId || videoId.includes("..") || videoId.includes("/")) {
      return new NextResponse("Invalid video ID", { status: 400 });
    }

    // videoId는 순수 UUID이므로 확장자를 찾아야 함
    // sections.json에서 videoFileName을 찾거나, 파일 시스템에서 찾기
    const videoDir = path.join(process.cwd(), "public", "videos");
    
    // 파일 시스템에서 {videoId}.* 패턴으로 파일 찾기
    let videoPath: string | null = null;
    try {
      const files = await fs.readdir(videoDir);
      const videoFile = files.find((file) => file.startsWith(sanitizedVideoId + "."));
      if (videoFile) {
        videoPath = path.join(videoDir, videoFile);
      }
    } catch (error) {
      console.error("Error reading video directory:", error);
    }

    // 파일을 찾지 못한 경우 sections.json에서 확장자 찾기
    if (!videoPath) {
      try {
        const sectionsFilePath = path.join(process.cwd(), "data", "sections.json");
        const sectionsContent = await fs.readFile(sectionsFilePath, "utf8");
        const sections = JSON.parse(sectionsContent);
        
        // 모든 섹션의 아이템에서 videoId로 찾기
        for (const section of sections) {
          for (const item of section.items || []) {
            if (item.videoId === sanitizedVideoId && item.videoFileName) {
              const fileExtension = path.extname(item.videoFileName);
              videoPath = path.join(videoDir, `${sanitizedVideoId}${fileExtension}`);
              break;
            }
          }
          if (videoPath) break;
        }
      } catch (error) {
        console.error("Error reading sections.json:", error);
      }
    }

    // 여전히 파일을 찾지 못한 경우
    if (!videoPath) {
      return new NextResponse("Video file not found", { status: 404 });
    }

    // 파일 존재 여부 확인
    try {
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

