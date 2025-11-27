import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

