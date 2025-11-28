import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const profileDir = path.join(process.cwd(), "public", "profile");
    
    // profile 디렉토리 확인
    try {
      await fs.access(profileDir);
    } catch {
      // 디렉토리가 없으면 null 반환
      return NextResponse.json({ imageUrl: null });
    }

    // 디렉토리 내 파일 목록 가져오기
    const files = await fs.readdir(profileDir);
    
    // 이미지 파일 필터링
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);
    });

    if (imageFiles.length === 0) {
      return NextResponse.json({ imageUrl: null });
    }

    // 첫 번째 이미지 파일 반환 (여러 개가 있으면 첫 번째 것 사용)
    const imageUrl = `/profile/${imageFiles[0]}`;
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // 이미지 파일 확장자 검증
    const ext = path.extname(imageFile.name).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed formats: jpg, jpeg, png, gif, webp, svg" },
        { status: 400 }
      );
    }

    // 프로필 디렉토리 경로
    const profileDir = path.join(process.cwd(), "public", "profile");
    
    // 디렉토리 생성 (없으면)
    await fs.mkdir(profileDir, { recursive: true });

    // 기존 프로필 이미지 삭제 (하나만 유지)
    try {
      const existingFiles = await fs.readdir(profileDir);
      const imageFiles = existingFiles.filter((file) => {
        const fileExt = path.extname(file).toLowerCase();
        return allowedExtensions.includes(fileExt);
      });
      
      // 기존 이미지 파일들 삭제
      for (const file of imageFiles) {
        await fs.unlink(path.join(profileDir, file));
      }
    } catch (error) {
      // 디렉토리가 없거나 읽을 수 없으면 무시
      console.log("No existing profile images to delete");
    }

    // 새 이미지 파일 저장
    const imageName = `profile${ext}`;
    const imagePath = path.join(profileDir, imageName);
    
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    await fs.writeFile(imagePath, imageBuffer);

    const imageUrl = `/profile/${imageName}`;
    
    return NextResponse.json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { error: "Failed to upload profile image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

