import { AssetDetail } from "@/components/asset-detail";
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ need?: string | string[] }> }) {
  const { id } = await params;
  const { need } = await searchParams;
  return <AssetDetail id={id} buyerNeedId={typeof need === "string" ? need : undefined} />;
}
