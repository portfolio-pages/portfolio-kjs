import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { SideBarSection } from "@/features/portfolio/components/SideBar";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    const sectionsFilePath = path.join(process.cwd(), "data", "sections.json");
    const sectionsContent = await fs.readFile(sectionsFilePath, "utf8");
    const sections: SideBarSection[] = JSON.parse(sectionsContent);

    // 아이템 찾기 및 삭제
    let itemFound = false;
    let videoId: string | undefined;

    for (const section of sections) {
      const itemIndex = section.items.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        videoId = section.items[itemIndex].videoId;
        section.items.splice(itemIndex, 1);
        itemFound = true;
        break;
      }
    }

    if (!itemFound) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // sections.json 저장
    await fs.writeFile(sectionsFilePath, JSON.stringify(sections, null, 2), "utf8");

    // 비디오 및 이미지 파일 삭제
    if (videoId) {
      const videoPath = path.join(process.cwd(), "public", "videos", videoId);
      const imagesDir = path.join(process.cwd(), "public", "images", videoId);
      
      // 비디오 파일 삭제
      try {
        await fs.access(videoPath);
        await fs.unlink(videoPath);
        console.log(`Deleted video file: ${videoPath}`);
      } catch (error) {
        // 파일이 없으면 무시
        console.log(`Video file not found: ${videoPath}`);
      }
      
      // 이미지 디렉토리 삭제
      try {
        await fs.access(imagesDir);
        await fs.rm(imagesDir, { recursive: true, force: true });
        console.log(`Deleted images directory: ${imagesDir}`);
      } catch (error) {
        // 디렉토리가 없으면 무시
        console.log(`Images directory not found: ${imagesDir}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Portfolio item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

