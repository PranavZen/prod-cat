import { useRef, useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchProducts } from "../features/catalogueSlice";
import { API } from "../config";

const UploadCSV = () => {
  const [loading, setLoading] = useState(false); const [extraColumns, setExtraColumns] = useState(""); const fileRef = useRef(null); const dispatch = useDispatch();
  const handleUpload = (event) => { const file = event.target.files[0]; if (!file) return; setLoading(true); Papa.parse(file, { header: true, skipEmptyLines: true, complete: async (results) => { try { const data = results.data; const extraCols = extraColumns.split(",").map((col) => col.trim()).filter(Boolean); if (extraCols.length) data.forEach((row) => extraCols.forEach((col) => { if (!(col in row)) row[col] = ""; })); await axios.post(API, { action: "uploadCSV", data }, { headers: { "Content-Type": "application/json" } }); alert("CSV Uploaded Successfully"); dispatch(fetchProducts()); if (fileRef.current) fileRef.current.value = ""; setExtraColumns(""); } catch (err) { console.error(err); alert("Upload Failed"); } setLoading(false); } }); };
  return <section className="surface-card grid gap-4 p-5"><div><h3 className="m-0 text-xl font-semibold text-slate-900">Upload CSV</h3><p className="mt-2 text-sm text-slate-500">Optional: add extra columns like <code>phoneVersion</code>, <code>battery</code>, <code>camera</code>, or <code>sound</code>. These will be created even if they are not in the CSV.</p></div><input type="text" placeholder="Extra columns (comma separated)" value={extraColumns} onChange={(event) => setExtraColumns(event.target.value)} className="field-input max-w-xl" /><div className="flex flex-wrap items-center gap-3"><input ref={fileRef} type="file" accept=".csv" onChange={handleUpload} className="field-input max-w-sm file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800" />{loading && <span className="text-sm text-slate-500">Uploading...</span>}</div></section>;
};

export default UploadCSV;