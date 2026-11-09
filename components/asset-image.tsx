import { Coffee, CookingPot, ImageIcon, Monitor, Package, Refrigerator, Snowflake, Store, Table2 } from "lucide-react";
const icons = { coffee: Coffee, refrigerator: Refrigerator, store: Store, table: Table2, snowflake: Snowflake, shelf: Package, desk: Monitor, utensils: CookingPot, package: ImageIcon };
export function AssetImage({ image, title, itemType }: { image: string; title: string; itemType?: string }) {
  if (/^data:image\/(jpeg|png|webp);base64,/i.test(image)) {
    // Locally selected data URLs are not compatible with Next's remote image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={`${title} 사진`} className="asset-photo" />;
  }
  const Icon = icons[image as keyof typeof icons] ?? ImageIcon;
  const label = itemType ?? title;
  return <div className="asset-image-fallback" role="img" aria-label={`${title} ${label}`}><Icon size={40} strokeWidth={1.2} aria-hidden="true" /><span>{label}</span></div>;
}
