import { createAnalyzeHandler } from "@/lib/ai/analyze-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = createAnalyzeHandler({ getConfig: () => ({ enabled: process.env.ENABLE_AI_ANALYSIS, apiKey: process.env.OPENAI_API_KEY, model: process.env.OPENAI_VISION_MODEL, nodeEnv: process.env.NODE_ENV, vercel: process.env.VERCEL }), fetcher: fetch });
