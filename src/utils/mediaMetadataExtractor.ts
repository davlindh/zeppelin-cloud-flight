/**
 * Media Metadata Extractor
 * 
 * Automatically extracts metadata from media files during upload:
 * - Images: width, height
 * - Videos: width, height, duration
 * - Audio: duration
 */

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  mimeType: string;
}

export async function extractMediaMetadata(file: File): Promise<MediaMetadata> {
  const type = file.type.split('/')[0];

  if (type === 'image') {
    return extractImageMetadata(file);
  } else if (type === 'video') {
    return extractVideoMetadata(file);
  } else if (type === 'audio') {
    return extractAudioMetadata(file);
  }

  return { mimeType: file.type };
}

async function extractImageMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        mimeType: file.type,
      });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ mimeType: file.type });
    };
    img.src = URL.createObjectURL(file);
  });
}

async function extractVideoMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: Math.floor(video.duration),
        mimeType: file.type,
      });
      URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      resolve({ mimeType: file.type });
    };
    
    video.src = URL.createObjectURL(file);
  });
}

async function extractAudioMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    
    audio.onloadedmetadata = () => {
      resolve({
        duration: Math.floor(audio.duration),
        mimeType: file.type,
      });
      URL.revokeObjectURL(audio.src);
    };
    
    audio.onerror = () => {
      resolve({ mimeType: file.type });
    };
    
    audio.src = URL.createObjectURL(file);
  });
}
