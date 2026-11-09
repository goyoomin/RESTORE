import type { ReactNode } from "react";
import { Coffee, CookingPot, ImageIcon, Monitor, Package, Refrigerator, Snowflake, Store, Table2 } from "lucide-react";
const icons = { coffee: Coffee, refrigerator: Refrigerator, store: Store, table: Table2, snowflake: Snowflake, shelf: Package, desk: Monitor, utensils: CookingPot, package: ImageIcon };
const illustrated = new Set(["coffee", "refrigerator", "store", "table", "snowflake", "shelf", "desk", "utensils"]);

function EquipmentDrawing({ type }: { type: string }) {
  const common = <><rect x="8" y="8" width="264" height="184" rx="20" fill="#eef3e9" /><circle cx="226" cy="43" r="18" fill="#e7ba70" opacity=".72" /><path d="M30 158c34-15 63-13 91-3 42 15 72 12 129-6v33H30z" fill="#dce8d9" /></>;
  let equipment: ReactNode;
  switch (type) {
    case "coffee": equipment = <g stroke="#164b3c" strokeWidth="5" strokeLinejoin="round"><rect x="76" y="54" width="128" height="91" rx="9" fill="#2f8c71" /><path d="M84 68h112M100 55V42h80v13" fill="none" /><rect x="96" y="79" width="30" height="25" rx="3" fill="#faf8f3" /><rect x="151" y="79" width="30" height="25" rx="3" fill="#faf8f3" /><path d="M110 104v20m56-20v20M91 146v10m98-10v10" fill="none" /><path d="M103 126h14m42 0h14" stroke="#e7ba70" strokeWidth="7" /></g>; break;
    case "refrigerator": equipment = <g stroke="#164b3c" strokeWidth="5" strokeLinejoin="round"><rect x="87" y="37" width="108" height="126" rx="10" fill="#fff" /><path d="M88 94h106M174 57v23m0 29v22" fill="none" strokeLinecap="round" /><path d="M101 51h53" stroke="#dce8d9" strokeWidth="8" strokeLinecap="round" /><circle cx="111" cy="146" r="3" fill="#e7ba70" stroke="none" /></g>; break;
    case "store": equipment = <g stroke="#164b3c" strokeWidth="5" strokeLinejoin="round"><path d="M55 68h170v79H55z" fill="#fff" /><path d="M64 68V43h152v25M62 91h156M62 119h156" fill="none" /><path d="M55 147v15m170-15v15" fill="none" /><path d="M85 59c6-20 30-20 35 0m20 0c6-21 31-20 36 0" fill="#e7ba70" stroke="#a96839" strokeWidth="3" /></g>; break;
    case "table": equipment = <g stroke="#164b3c" strokeWidth="6" strokeLinejoin="round"><path d="M72 92h136v17H72z" fill="#b87945" /><path d="M86 109v50m108-50v50" fill="none" /><path d="M54 76h34v44H54zm158 0h34v44h-34z" fill="#fff" /><path d="M62 120v30m18-30v30m140-30v30m18-30v30" fill="none" /></g>; break;
    case "snowflake": equipment = <g stroke="#164b3c" strokeWidth="5" strokeLinejoin="round"><path d="M85 71h110v83H85z" fill="#fff" /><path d="M99 55h82v16H99z" fill="#2f8c71" /><path d="M100 99h80v37h-80z" fill="#dce8d9" /><path d="M106 143v13m68-13v13" fill="none" /><path d="m121 110 10 10m0-10-10 10m31-10 10 10m0-10-10 10" stroke="#2f8c71" strokeWidth="4" /></g>; break;
    case "shelf": equipment = <g stroke="#164b3c" strokeWidth="5" strokeLinejoin="round"><path d="M78 43v119m124-119v119M78 78h124M78 119h124M78 159h124" fill="none" /><path d="M91 55h32v22H91zm48-2h47v25h-47zM92 91h48v25H92zm64 6h34v21h-34zm-61 34h33v27H95zm50 2h43v25h-43z" fill="#e7ba70" /><path d="M100 61h14m-14 37h26m39-35h17m-89 46h18m48 27h25" stroke="#fff" strokeWidth="3" /></g>; break;
    case "desk": equipment = <g stroke="#164b3c" strokeWidth="5" strokeLinejoin="round"><path d="M72 112h142v14H72z" fill="#b87945" /><path d="M85 126v36m116-36v36" fill="none" /><rect x="112" y="55" width="69" height="49" rx="5" fill="#fff" /><path d="M146 104v8m-26 0h52" fill="none" /><path d="M123 145h42" stroke="#2f8c71" strokeWidth="4" /></g>; break;
    case "utensils": equipment = <g stroke="#164b3c" strokeWidth="5" strokeLinejoin="round"><path d="M74 67h132v18H74z" fill="#2f8c71" /><path d="M86 85v68m108-68v68" fill="none" /><rect x="87" y="94" width="106" height="48" rx="3" fill="#fff" /><circle cx="113" cy="76" r="13" fill="#fff" /><circle cx="167" cy="76" r="13" fill="#fff" /><circle cx="113" cy="76" r="6" fill="#e7ba70" stroke="none" /><circle cx="167" cy="76" r="6" fill="#e7ba70" stroke="none" /><path d="M102 110h76m-76 20h76" fill="none" stroke="#dce8d9" strokeWidth="5" /></g>;
    default: return null;
  }
  return <svg className="equipment-art" viewBox="0 0 280 200" aria-hidden="true" focusable="false">{common}{equipment}</svg>;
}
export function AssetImage({ image, title, itemType }: { image: string; title: string; itemType?: string }) {
  if (/^data:image\/(jpeg|png|webp);base64,/i.test(image)) {
    // Locally selected data URLs are not compatible with Next's remote image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={`${title} 사진`} className="asset-photo" />;
  }
  const label = itemType ?? title;
  if (illustrated.has(image)) return <div className="asset-image-fallback" role="img" aria-label={`${title} ${label}`}><EquipmentDrawing type={image} /><span>{label}</span></div>;
  const Icon = icons[image as keyof typeof icons] ?? ImageIcon;
  return <div className="asset-image-fallback" role="img" aria-label={`${title} ${label}`}><Icon size={40} strokeWidth={1.2} aria-hidden="true" /><span>{label}</span></div>;
}
