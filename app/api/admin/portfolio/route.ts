import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { SideBarSection } from "@/features/portfolio/components/SideBar";
import type { NavSectionItem } from "@/features/portfolio/components";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

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
    let videoId: string | undefined;
    let videoFileName: string | undefined;
    if (videoFile && videoFile.size > 0) {
      // 원본 파일명 저장
      videoFileName = videoFile.name;
      
      // 확장자 추출
      const fileExtension = path.extname(videoFileName);
      
      const videoDir = path.join(process.cwd(), "public", "videos");
      // 디렉토리 확인 및 생성
      await fs.mkdir(videoDir, { recursive: true });
      
      // UUID 생성 및 충돌 방지 (파일이 이미 존재하면 새로운 UUID 생성)
      let uuid: string;
      let videoPath: string;
      let maxAttempts = 10; // 최대 10번 시도
      
      do {
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
      
      // 파일 저장
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
      await fs.writeFile(videoPath, videoBuffer);
    }

    // 이미지 파일 저장
    const imagePaths: string[] = [];
    if (imageFiles.length > 0 && videoId) {
      const imagesDir = path.join(process.cwd(), "public", "images", videoId);
      await fs.mkdir(imagesDir, { recursive: true });

      for (const imageFile of imageFiles) {
        if (imageFile.size > 0) {
          const imageName = imageFile.name;
          const imagePath = path.join(imagesDir, imageName);
          
          const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
          await fs.writeFile(imagePath, imageBuffer);
          
          imagePaths.push(`/images/${videoId}/${imageName}`);
        }
      }
    }

    // sections.json 읽기 및 업데이트
    const sectionsFilePath = path.join(process.cwd(), "data", "sections.json");
    const sectionsContent = await fs.readFile(sectionsFilePath, "utf8");
    const sections: SideBarSection[] = JSON.parse(sectionsContent);

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
      return NextResponse.json(
        { error: `Section with id "${sectionId}" not found` },
        { status: 404 }
      );
    }

    sections[sectionIndex].items.push(newItem);

    // sections.json 저장
    await fs.writeFile(sectionsFilePath, JSON.stringify(sections, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Portfolio added successfully",
      item: newItem,
    });
  } catch (error) {
    console.error("Error adding portfolio:", error);
    return NextResponse.json(
      { error: "Failed to add portfolio", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

