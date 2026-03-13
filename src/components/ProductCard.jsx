import { Link } from "react-router-dom";
import { getRecordTitle, getRecordImageUrl, getKeysToHideFromDetail } from "../utils/recordHelpers";

const ProductCard = ({ record }) => {
  const title = getRecordTitle(record); const imageUrl = getRecordImageUrl(record); const keysToHide = getKeysToHideFromDetail(record); const recordId = record.id != null ? record.id : record._id; if (recordId == null) return null;
  const fields = Object.entries(record).filter(([key, value]) => !keysToHide.has(key) && value != null && value !== "");
  return <Link to={`/record/${recordId}`} className="block h-full text-inherit no-underline"><article className="surface-card h-full overflow-hidden p-4"><div className="grid gap-3">{imageUrl && <img src={imageUrl} alt="" className="h-40 w-full rounded-2xl bg-slate-100 object-cover" />}<h3 className="m-0 text-lg font-semibold text-slate-900">{title}</h3>{fields.slice(0, 4).map(([key, value]) => <p key={key} className="m-0 text-sm text-slate-600"><strong>{key}:</strong> {String(value).slice(0, 50)}{String(value).length > 50 ? "…" : ""}</p>)}</div></article></Link>;
};

export default ProductCard;