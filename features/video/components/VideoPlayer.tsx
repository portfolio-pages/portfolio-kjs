"use client";

import { VideoPlayerProps } from "../types";

export function VideoPlayer({
  videoId,
  autoPlay = false,
  controls = true,
  muted = false,
}: VideoPlayerProps) {
  const videoSrc = `/api/video/${videoId}`;

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        src={videoSrc}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
        className="w-full h-full object-contain"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

