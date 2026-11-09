import { AssetRegistration } from "@/components/asset-registration";
export default function Page() {
  const aiAnalysisEnabled = process.env.NODE_ENV === "development" && process.env.ENABLE_AI_ANALYSIS === "true" && Boolean(process.env.OPENAI_API_KEY?.trim()) && Boolean(process.env.OPENAI_VISION_MODEL?.trim()) && !process.env.VERCEL;
  return <AssetRegistration aiAnalysisEnabled={aiAnalysisEnabled} />;
}
