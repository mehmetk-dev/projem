import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { logServerError, unexpectedJsonError } from '@/lib/server/error-response';
import { ExternalServiceError, UnauthorizedError, ValidationError } from '@/lib/server/app-error';
import { getChatSettings, getAllUserContext } from '@/app/actions/chat';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      throw new UnauthorizedError();
    }

    const body = await req.json();
    const { messages, model, temperature, apiKey } = body;

    if (!Array.isArray(messages)) {
      throw new ValidationError('Mesaj listesi geçersiz.');
    }

    const key = apiKey || process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new ValidationError('OpenRouter API key eksik.');
    }

    // Fetch user settings and context securely on the server
    const [settings, ctx] = await Promise.all([
      getChatSettings(),
      getAllUserContext(),
    ]);

    const lines: string[] = ['Kullanıcının veritabanındaki verileri:'];
    if (ctx.notes.length) { lines.push('Notlar:'); ctx.notes.forEach((n) => lines.push(`- ${n.title}: ${n.content.slice(0, 200)}`)); }
    if (ctx.blogs.length) { lines.push('Bloglar:'); ctx.blogs.forEach((b) => lines.push(`- ${b.title} (${b.category})`)); }
    if (ctx.todos.length) { lines.push('Görevler:'); ctx.todos.forEach((t) => lines.push(`- ${t.title} [${t.completed ? 'tamamlandı' : 'bekliyor'}]`)); }
    if (ctx.bookmarks.length) { lines.push('Linkler:'); ctx.bookmarks.forEach((b) => lines.push(`- ${b.title}: ${b.url}`)); }
    if (ctx.snippets.length) { lines.push('Kodlar:'); ctx.snippets.forEach((s) => lines.push(`- ${s.title} (${s.language})`)); }
    if (ctx.projects.length) { lines.push('Projeler:'); ctx.projects.forEach((p) => lines.push(`- ${p.title}: ${p.description.slice(0, 120)}`)); }
    if (ctx.journal.length) { lines.push('Günlükler:'); ctx.journal.forEach((j) => lines.push(`- [${j.entryDate}] ${j.title} (${j.mood}): ${j.content.slice(0, 200)}`)); }
    const contextStr = lines.join('\n');

    const systemPrompt = `${settings?.systemPrompt || 'Sen Mehmet Kerem\'in kisisel asistanisin.'}\n\n${contextStr}`;

    const payload = {
      model: model || 'openai/gpt-4o-mini',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages,
      ],
      temperature: typeof temperature === 'number' ? temperature : parseFloat(temperature || '0.7'),
      stream: true,
    };

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost',
        'X-Title': 'Portfolio Dashboard Chat',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      logServerError('Chat API upstream error', text, { status: res.status });
      throw new ExternalServiceError('Yapay zeka servisi şu anda yanıt veremiyor.', { status: res.status });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body?.getReader();
        if (!reader) { controller.close(); return; }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return unexpectedJsonError('Chat API error', error);
  }
}
