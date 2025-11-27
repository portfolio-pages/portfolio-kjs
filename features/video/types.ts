export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  thumbnail?: string;
  filePath: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VideoPlayerProps {
  videoId: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  isExpanded?: boolean;
}

