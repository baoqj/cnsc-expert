type ChatRequestBody = {
  query?: string;
  conversationId?: string;
  userId?: string;
};

type DifyRetrieverResource = {
  document_name?: string;
  dataset_name?: string;
  segment_id?: string;
};

type DifyChatResponse = {
  answer?: string;
  conversation_id?: string;
  message_id?: string;
  metadata?: {
    retriever_resources?: DifyRetrieverResource[];
  };
};

const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '');

const readRequestBody = (rawBody: unknown): ChatRequestBody => {
  if (!rawBody) return {};
  if (typeof rawBody === 'string') {
    try {
      return JSON.parse(rawBody) as ChatRequestBody;
    } catch {
      return {};
    }
  }
  if (typeof rawBody === 'object') {
    return rawBody as ChatRequestBody;
  }
  return {};
};

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const difyBaseUrl = process.env.DIFY_BASE_URL;
  const difyApiKey = process.env.DIFY_APP_API_KEY;

  if (!difyBaseUrl || !difyApiKey) {
    res.status(500).json({
      error: 'Missing server configuration: DIFY_BASE_URL or DIFY_APP_API_KEY.',
    });
    return;
  }

  const body = readRequestBody(req.body);
  const query = typeof body.query === 'string' ? body.query.trim() : '';
  const conversationId =
    typeof body.conversationId === 'string' && body.conversationId.trim()
      ? body.conversationId.trim()
      : undefined;
  const userId =
    typeof body.userId === 'string' && body.userId.trim()
      ? body.userId.trim()
      : 'cnsc-web-user';

  if (!query) {
    res.status(400).json({ error: 'query is required.' });
    return;
  }

  const timeoutMs = Number(process.env.DIFY_TIMEOUT_MS || 60000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstreamResponse = await fetch(`${normalizeBaseUrl(difyBaseUrl)}/v1/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: 'blocking',
        conversation_id: conversationId,
        user: userId,
      }),
      signal: controller.signal,
    });

    const rawText = await upstreamResponse.text();
    let upstreamData: DifyChatResponse | { [key: string]: unknown } = {};

    try {
      upstreamData = rawText ? (JSON.parse(rawText) as DifyChatResponse) : {};
    } catch {
      upstreamData = { raw: rawText };
    }

    if (!upstreamResponse.ok) {
      res.status(upstreamResponse.status).json({
        error: 'Dify request failed.',
        details: upstreamData,
      });
      return;
    }

    const retrieverResources = Array.isArray((upstreamData as DifyChatResponse).metadata?.retriever_resources)
      ? ((upstreamData as DifyChatResponse).metadata?.retriever_resources as DifyRetrieverResource[])
      : [];
    const sources = Array.from(
      new Set(
        retrieverResources
          .map((item) => item.document_name || item.dataset_name || item.segment_id || '')
          .filter(Boolean)
      )
    );

    res.status(200).json({
      answer: (upstreamData as DifyChatResponse).answer || '',
      conversationId: (upstreamData as DifyChatResponse).conversation_id || null,
      messageId: (upstreamData as DifyChatResponse).message_id || null,
      sources,
    });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    res.status(isAbort ? 504 : 500).json({
      error: isAbort ? 'Dify request timed out.' : 'Failed to call Dify service.',
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timer);
  }
}
