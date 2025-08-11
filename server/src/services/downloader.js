import ytdlp from 'yt-dlp-exec';
import ffmpegPath from 'ffmpeg-static';

export function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  if (u.includes('tiktok.com')) return 'TikTok';
  if (u.includes('instagram.com')) return 'Instagram';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'X/Twitter';
  return 'Otro';
}

/**
 * Descarga audio con yt-dlp; usa ffmpeg estático para asegurar compatibilidad en servidores.
 * Guarda como MP3 por ser ampliamente compatible (OpenAI también acepta m4a/mp3).
 */
export async function downloadAudio(url, outFile) {
  const result = await ytdlp(url, {
    // Post-procesado a mp3 (requiere ffmpeg, proveemos ruta con ffmpeg-static)
    extractAudio: true,
    audioFormat: 'mp3',
    audioQuality: 0,
    output: outFile,
    printJson: true,
    noWarnings: true,
    preferFreeFormats: true,
    ffmpegLocation: ffmpegPath || undefined
  });

  let meta = {};
  try {
    meta = typeof result === 'string' ? JSON.parse(result) : result;
  } catch {
    meta = {};
  }
  return {
    title: meta.title || null,
    uploader: meta.uploader || meta.channel || null,
    duration: meta.duration || null
  };
}
