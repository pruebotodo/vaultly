import OpenAI from 'openai';

/**
 * Si hay OPENAI_API_KEY, usamos LLM para hacer resumen y bullets.
 * Si no, hacemos un resumen heurístico (top oraciones).
 */
export async function summarizeText(text, context = {}) {
  const hasKey = !!process.env.OPENAI_API_KEY;
  if (!text || !text.trim()) {
    return { summary: 'Sin contenido para resumir.', keyPoints: [] };
  }

  if (!hasKey) {
    const { summary, keyPoints } = naiveExtractiveSummary(text);
    return { summary, keyPoints };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL_SUMMARY || 'gpt-4o-mini';

  const prompt = [
    'Eres un analista que resume transcripciones de audio para un repositorio.' +
    ' Devuelve un JSON con dos campos: "summary" (1 párrafo de 5-7 líneas) y "key_points" (5-8 bullets concisos).',
    'Ten en cuenta el público general, evita jerga innecesaria y usa español neutro.',
    context?.title ? `Título: ${context.title}` : '',
    context?.platform ? `Plataforma: ${context.platform}` : '',
    '',
    'Transcripción completa:',
    text
  ].filter(Boolean).join('\n');

  const resp = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'Eres un asistente que responde únicamente con JSON válido.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2
  });

  let content = resp.choices?.[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(content);
    return { summary: parsed.summary || '', keyPoints: parsed.key_points || [] };
  } catch {
    // Fallback si el modelo devolvió algo no-JSON
    return {
      summary: content.slice(0, 1200),
      keyPoints: []
    };
  }
}

function naiveExtractiveSummary(text) {
  // Muy simple: tomar primeras 6 oraciones largas y bullets con frases clave
  const sentences = text.split(/(?<=[\.\!\?])\s+/).filter(s => s && s.length > 30);
  const top = sentences.slice(0, 6);
  const summary = top.join(' ');
  // key points: primeras 6 oraciones recortadas
  const keyPoints = top.map(s => s.length > 160 ? s.slice(0, 157) + '…' : s);
  return { summary: summary || text.slice(0, 800), keyPoints };
}
