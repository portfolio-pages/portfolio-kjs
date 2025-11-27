import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { SideBarSection } from "@/features/portfolio/components/SideBar";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params;

    const sectionsFilePath = path.join(process.cwd(), "data", "sections.json");
    const sectionsContent = await fs.readFile(sectionsFilePath, "utf8");
    const sections: SideBarSection[] = JSON.parse(sectionsContent);

    // 섹션 찾기 및 삭제
    const sectionIndex = sections.findIndex((section) => section.id === sectionId);
    if (sectionIndex === -1) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    // 섹션 내의 모든 아이템의 비디오 및 이미지 파일 삭제
    const section = sections[sectionIndex];
    for (const item of section.items) {
      if (item.videoId) {
        const videoPath = path.join(process.cwd(), "public", "videos", item.videoId);
        const imagesDir = path.join(process.cwd(), "public", "images", item.videoId);
        
        // 비디오 파일 삭제
        try {
          await fs.access(videoPath);
          await fs.unlink(videoPath);
          console.log(`Deleted video file: ${videoPath}`);
        } catch (error) {
          console.log(`Video file not found: ${videoPath}`);
        }
        
        // 이미지 디렉토리 삭제
        try {
          await fs.access(imagesDir);
          await fs.rm(imagesDir, { recursive: true, force: true });
          console.log(`Deleted images directory: ${imagesDir}`);
        } catch (error) {
          console.log(`Images directory not found: ${imagesDir}`);
        }
      }
    }

    // 섹션 삭제
    sections.splice(sectionIndex, 1);

    // sections.json 저장
    await fs.writeFile(sectionsFilePath, JSON.stringify(sections, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Failed to delete section", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

