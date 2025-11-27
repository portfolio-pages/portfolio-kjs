"use client";

import { VideoPlayerProps } from "../types";

export function VideoPlayer({ videoId, autoPlay = false, controls = true, muted = false }: VideoPlayerProps) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        src={`/api/video/${videoId}`}
        autoPlay={autoPlay}
        controls={controls}
        muted={muted}
        className="w-full h-full object-contain"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

