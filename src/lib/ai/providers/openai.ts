import type {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResult,
  AIEmbeddingResult,
  AIModelTier,
} from "./types";

const MODEL_MAP: Record<AIModelTier, string> = {
  fast: process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini",
  primary: process.env.OPENAI_MODEL_PRIMARY ?? "gpt-4o",
  embedding: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
};

function getApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

async function openaiFetch(path: string, body: unknown) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const res = await fetch(`https://api.openai.com/v1/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  return res.json();
}

export class OpenAIProvider implements AIProvider {
  isAvailable(): boolean {
    return Boolean(getApiKey());
  }

  resolveModel(tier: AIModelTier = "fast", override?: string): string {
    return override ?? MODEL_MAP[tier];
  }

  async complete(
    messages: AIMessage[],
    options: AICompletionOptions = {}
  ): Promise<AICompletionResult> {
    const model = this.resolveModel(options.tier ?? "fast", options.model);

    const body: Record<string, unknown> = {
      model,
      messages,
      max_tokens: options.maxTokens ?? 1024,
      temperature: options.temperature ?? 0.7,
    };

    if (options.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const json = await openaiFetch("chat/completions", body);
    const content = json.choices?.[0]?.message?.content?.trim() ?? "";

    return {
      content,
      model,
      usage: json.usage
        ? {
            promptTokens: json.usage.prompt_tokens,
            completionTokens: json.usage.completion_tokens,
          }
        : undefined,
    };
  }

  async embed(text: string): Promise<AIEmbeddingResult> {
    const model = MODEL_MAP.embedding;
    const json = await openaiFetch("embeddings", { model, input: text });
    return {
      embedding: json.data?.[0]?.embedding ?? [],
      model,
    };
  }
}

let _provider: OpenAIProvider | null = null;

export function getAIProvider(): OpenAIProvider {
  if (!_provider) _provider = new OpenAIProvider();
  return _provider;
}

export async function aiComplete(
  messages: AIMessage[],
  options?: AICompletionOptions
): Promise<AICompletionResult> {
  return getAIProvider().complete(messages, options);
}

export async function aiEmbed(text: string): Promise<AIEmbeddingResult> {
  return getAIProvider().embed(text);
}

export function parseAIJson<T>(content: string): T {
  const cleaned = content.replace(/^```json\n?|\n?```$/g, "").trim();
  return JSON.parse(cleaned) as T;
}
