import fs from 'fs';
import OpenAI from 'openai';

/**
 * Transcribe usando OpenAI si hay API key. Si no, devolvemos una "transcripción"
 * mínima basada en un placeholder para permitir que el flujo siga siendo funcional.
 * (Se podría integrar aquí un transcriptor local en el futuro)
 */
export async function transcribeAudio(audioPath) {
  const hasKey = !!process.env.OPENAI_API_KEY;
  if (!hasKey) {
    console.warn('[Vaultly] OPENAI_API_KEY no definido. Se generará una transcripción mínima.');
    return 'Transcripción no disponible (no se configuró OPENAI_API_KEY).';
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL_TRANSCRIBE || 'whisper-1';

  const fileStream = fs.createReadStream(audioPath);

  // API de OpenAI (Audio → Transcriptions)
  const resp = await openai.audio.transcriptions.create({
    file: fileStream,
    model,
    // language: 'es', // opcional
  });

  // El SDK devuelve { text: '...' } generalmente
  const text = resp.text || '';
  return text.trim();
}
