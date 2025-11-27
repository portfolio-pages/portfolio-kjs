import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { SideBarSection } from "@/features/portfolio/components/SideBar";

export async function GET() {
  try {
    // JSON 파일 경로
    const filePath = path.join(process.cwd(), "data", "sections.json");
    
    // 파일 읽기
    const fileContents = await fs.readFile(filePath, "utf8");
    const sections: SideBarSection[] = JSON.parse(fileContents);
    
    return NextResponse.json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}
