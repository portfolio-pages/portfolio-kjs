import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { SideBarSection } from "@/features/portfolio/components/SideBar";
import type { NavSectionItem } from "@/features/portfolio/components";

export async function POST(request: NextRequest) {
  // 롤백을 위한 저장된 파일 경로 추적
  const createdFiles: string[] = [];
  const createdDirs: string[] = [];
  let videoId: string | undefined;
  let videoPath: string | undefined;
  let imagesDir: string | undefined;

  // 타임아웃 설정 (5분)
  const TIMEOUT_MS = 5 * 60 * 1000;
  const startTime = Date.now();

  // 클라이언트 연결 끊김 감지
  const abortSignal = request.signal;
  let isAborted = false;

  // AbortSignal 이벤트 리스너
  if (abortSignal) {
    abortSignal.addEventListener('abort', () => {
      isAborted = true;
      console.warn('Client connection aborted during upload');
    });
  }

  // 중단 확인 헬퍼 함수
  const checkAborted = () => {
    // 타임아웃 확인
    if (Date.now() - startTime > TIMEOUT_MS) {
      throw new Error('Upload timeout exceeded');
    }
    // 클라이언트 연결 끊김 확인
    if (isAborted || (abortSignal && abortSignal.aborted)) {
      throw new Error('Client connection aborted');
    }
  };

  // 롤백 함수: 실패 시 생성된 파일 및 디렉토리 정리
  const rollback = async () => {
    try {
      // 저장된 이미지 파일 삭제
      for (const filePath of createdFiles) {
        try {
          await fs.unlink(filePath);
          console.log(`Rollback: Deleted file ${filePath}`);
        } catch (err) {
          console.error(`Rollback: Failed to delete file ${filePath}:`, err);
        }
      }

      // 비디오 파일 삭제
      if (videoPath) {
        try {
          await fs.unlink(videoPath);
          console.log(`Rollback: Deleted video file ${videoPath}`);
        } catch (err) {
          console.error(`Rollback: Failed to delete video file ${videoPath}:`, err);
        }
      }

      // 생성된 이미지 디렉토리 삭제
      if (imagesDir) {
        try {
          await fs.rm(imagesDir, { recursive: true, force: true });
          console.log(`Rollback: Deleted images directory ${imagesDir}`);
        } catch (err) {
          console.error(`Rollback: Failed to delete images directory ${imagesDir}:`, err);
        }
      }
    } catch (err) {
      console.error("Rollback error:", err);
    }
  };

  try {
    // 클라이언트 연결 확인
    checkAborted();

    const formData = await request.formData();

    // 클라이언트 연결 확인
    checkAborted();

    // 폼 데이터 추출
    const sectionId = formData.get("sectionId") as string;
    const title = formData.get("title") as string;
    const hashtags = (formData.get("hashtags") as string)?.split(",").map((tag) => tag.trim()) || [];
    const createdAt = formData.get("createdAt") as string;
    const joinRole = formData.get("joinRole") as string;
    const description = formData.get("description") as string;
    const videoFile = formData.get("video") as File | null;
    const imageFiles = formData.getAll("images") as File[];

    if (!sectionId || !title) {
      return NextResponse.json(
        { error: "sectionId and title are required" },
        { status: 400 }
      );
    }

    // 비디오 파일 저장
    let videoFileName: string | undefined;
    if (videoFile && videoFile.size > 0) {
      try {
        checkAborted();

        // 원본 파일명 저장
        videoFileName = videoFile.name;
        
        // 확장자 추출
        const fileExtension = path.extname(videoFileName);
        
        const videoDir = path.join(process.cwd(), "public", "videos");
        // 디렉토리 확인 및 생성
        await fs.mkdir(videoDir, { recursive: true });
        
        checkAborted();
        
        // UUID 생성 및 충돌 방지 (파일이 이미 존재하면 새로운 UUID 생성)
        let uuid: string;
        let maxAttempts = 10; // 최대 10번 시도
        
        do {
          checkAborted();
          uuid = randomUUID();
          videoId = uuid;
          videoPath = path.join(videoDir, `${videoId}${fileExtension}`);
          
          // 파일 존재 여부 확인
          try {
            await fs.access(videoPath);
            // 파일이 존재하면 새로운 UUID 생성
            maxAttempts--;
            if (maxAttempts <= 0) {
              throw new Error("Failed to generate unique video ID after multiple attempts");
            }
          } catch {
            // 파일이 없으면 사용 가능한 UUID
            break;
          }
        } while (true);
        
        checkAborted();
        
        // 파일 저장
        const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
        checkAborted();
        await fs.writeFile(videoPath, videoBuffer);
        console.log(`Video file saved: ${videoPath}`);
      } catch (error) {
        // 클라이언트 연결 끊김 또는 타임아웃인 경우
        if (error instanceof Error && 
            (error.message === 'Client connection aborted' || error.message === 'Upload timeout exceeded')) {
          console.warn(`Upload interrupted during video file save: ${error.message}`);
          await rollback();
          return NextResponse.json(
            { error: error.message === 'Upload timeout exceeded' ? "Upload timeout" : "Upload cancelled by client" },
            { status: error.message === 'Upload timeout exceeded' ? 408 : 499 }
          );
        }
        console.error("Error saving video file:", error);
        await rollback();
        return NextResponse.json(
          { error: "Failed to save video file", details: error instanceof Error ? error.message : "Unknown error" },
          { status: 500 }
        );
      }
    }

    // 이미지 파일 저장
    const imagePaths: string[] = [];
    if (imageFiles.length > 0 && videoId) {
      try {
        checkAborted();
        imagesDir = path.join(process.cwd(), "public", "images", videoId);
        await fs.mkdir(imagesDir, { recursive: true });

        for (const imageFile of imageFiles) {
          checkAborted();
          if (imageFile.size > 0) {
            try {
              const imageName = imageFile.name;
              const imagePath = path.join(imagesDir, imageName);
              
              const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
              checkAborted();
              await fs.writeFile(imagePath, imageBuffer);
              createdFiles.push(imagePath);
              
              imagePaths.push(`/images/${videoId}/${imageName}`);
            } catch (error) {
              // 클라이언트 연결 끊김인 경우
              if (error instanceof Error && error.message === 'Client connection aborted') {
                throw error; // 상위로 전파
              }
              console.error(`Error saving image file ${imageFile.name}:`, error);
              // 개별 이미지 저장 실패는 계속 진행하되 로그만 남김
            }
          }
        }
      } catch (error) {
        // 클라이언트 연결 끊김 또는 타임아웃인 경우
        if (error instanceof Error && 
            (error.message === 'Client connection aborted' || error.message === 'Upload timeout exceeded')) {
          console.warn(`Upload interrupted during image files save: ${error.message}`);
          await rollback();
          return NextResponse.json(
            { error: error.message === 'Upload timeout exceeded' ? "Upload timeout" : "Upload cancelled by client" },
            { status: error.message === 'Upload timeout exceeded' ? 408 : 499 }
          );
        }
        console.error("Error saving image files:", error);
        await rollback();
        return NextResponse.json(
          { error: "Failed to save image files", details: error instanceof Error ? error.message : "Unknown error" },
          { status: 500 }
        );
      }
    }

    // sections.json 읽기 및 업데이트
    try {
      checkAborted();
      const sectionsFilePath = path.join(process.cwd(), "data", "sections.json");
      const sectionsContent = await fs.readFile(sectionsFilePath, "utf8");
      const sections: SideBarSection[] = JSON.parse(sectionsContent);

      checkAborted();

      // 새 아이템 생성
      const newItem: NavSectionItem = {
        id: Date.now().toString(), // 간단한 ID 생성
        title,
        hashtags,
        ...(createdAt && { createdAt }),
        ...(joinRole && { joinRole }),
        ...(description && { description }),
        ...(videoId && { videoId }),
        ...(videoFileName && { videoFileName }),
      };

      // 해당 섹션 찾기 및 아이템 추가
      const sectionIndex = sections.findIndex((section) => section.id === sectionId);
      if (sectionIndex === -1) {
        await rollback();
        return NextResponse.json(
          { error: `Section with id "${sectionId}" not found` },
          { status: 404 }
        );
      }

      checkAborted();
      sections[sectionIndex].items.push(newItem);

      // sections.json 저장 (원자적 작업: 모든 파일이 저장된 후에만 실행)
      await fs.writeFile(sectionsFilePath, JSON.stringify(sections, null, 2), "utf8");
      console.log("Portfolio item added successfully");

      // 모든 작업이 성공적으로 완료됨
      return NextResponse.json({
        success: true,
        message: "Portfolio added successfully",
        item: newItem,
      });
    } catch (error) {
      // 클라이언트 연결 끊김 또는 타임아웃인 경우
      if (error instanceof Error && 
          (error.message === 'Client connection aborted' || error.message === 'Upload timeout exceeded')) {
        console.warn(`Upload interrupted during sections.json update: ${error.message}`);
        await rollback();
        return NextResponse.json(
          { error: error.message === 'Upload timeout exceeded' ? "Upload timeout" : "Upload cancelled by client" },
          { status: error.message === 'Upload timeout exceeded' ? 408 : 499 }
        );
      }
      console.error("Error updating sections.json:", error);
      await rollback();
      return NextResponse.json(
        { error: "Failed to update sections.json", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error) {
    // 클라이언트 연결 끊김 또는 타임아웃인 경우
    if (error instanceof Error && 
        (error.message === 'Client connection aborted' || error.message === 'Upload timeout exceeded')) {
      console.warn(`Upload interrupted: ${error.message}`);
      await rollback();
      return NextResponse.json(
        { error: error.message === 'Upload timeout exceeded' ? "Upload timeout" : "Upload cancelled by client" },
        { status: error.message === 'Upload timeout exceeded' ? 408 : 499 }
      );
    }
    console.error("Unexpected error adding portfolio:", error);
    await rollback();
    return NextResponse.json(
      { error: "Failed to add portfolio", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

