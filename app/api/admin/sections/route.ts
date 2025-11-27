import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { SideBarSection } from "@/features/portfolio/components/SideBar";

export async function GET() {
  try {
    const sectionsFilePath = path.join(process.cwd(), "data", "sections.json");
    const sectionsContent = await fs.readFile(sectionsFilePath, "utf8");
    const sections = JSON.parse(sectionsContent);

    // 섹션 목록만 반환 (id, name)
    const sectionList = sections.map((section: { id: string; name: string }) => ({
      id: section.id,
      name: section.name,
    }));

    return NextResponse.json(sectionList);
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Section name is required" },
        { status: 400 }
      );
    }

    const sectionsFilePath = path.join(process.cwd(), "data", "sections.json");
    const sectionsContent = await fs.readFile(sectionsFilePath, "utf8");
    const sections: SideBarSection[] = JSON.parse(sectionsContent);

    // 새 섹션 생성
    const newSection: SideBarSection = {
      id: `section-${Date.now()}`,
      name: name.startsWith("#") ? name : `#${name}`,
      status: "closed",
      items: [],
    };

    sections.push(newSection);

    // sections.json 저장
    await fs.writeFile(sectionsFilePath, JSON.stringify(sections, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Section added successfully",
      section: newSection,
    });
  } catch (error) {
    console.error("Error adding section:", error);
    return NextResponse.json(
      { error: "Failed to add section", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
