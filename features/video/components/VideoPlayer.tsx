"use client";

import { useEffect, useRef } from "react";
import { VideoPlayerProps } from "../types";

export function VideoPlayer({
  videoId,
  autoPlay = true,
  controls = true,
  muted: externalMuted,
  isExpanded = false,
}: VideoPlayerProps) {
  const videoSrc = `/api/video/${videoId}`;
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 확장 상태에 따라 muted 결정 (확장되지 않았으면 muted, 확장되면 unmuted)
  const muted = externalMuted !== undefined ? externalMuted : !isExpanded;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
        className="w-full h-full object-contain"
        preload="auto"
        playsInline
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

