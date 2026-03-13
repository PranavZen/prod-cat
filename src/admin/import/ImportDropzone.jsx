import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CsvMappingEditor from "./CsvMappingEditor";
import Toast from "../../components/Toast";
import {
  clearImportSummary,
  selectErrorByAction,
  selectImportValidation,
  selectLoadingByAction,
  uploadCSV,
  validateCsvImport,
} from "../../store/catalogueSlice";
import { analyzeCsvRows } from "../../utils/csvAnalysis";
import {
  buildImportSummary,
  buildMappedRows,
  getDefaultCsvMapping,
  summarizeMapping,
} from "../../utils/csvMapping";
import { parseCsvFile } from "../../utils/csvParser";

const ImportDropzone = () => {
  const dispatch = useDispatch();
  const busy = useSelector(selectLoadingByAction("uploadCSV"));
  const validating = useSelector(selectLoadingByAction("validateCsvImport"));
  const validation = useSelector(selectImportValidation);
  const uploadError = useSelector(selectErrorByAction("uploadCSV"));
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [mapping, setMapping] = useState({});
  const [toast, setToast] = useState(null);
  const headers = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);
  const mappedRows = useMemo(
    () => buildMappedRows(rows, mapping),
    [mapping, rows],
  );
  const localAnalysis = useMemo(() => analyzeCsvRows(mappedRows), [mappedRows]);
  const mappingSummary = useMemo(() => summarizeMapping(mapping), [mapping]);
  const analysis = validation || localAnalysis;

  useEffect(() => {
    if (!toast?.message) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!uploadError) return;
    setToast({ tone: "error", title: "Import failed", message: uploadError });
  }, [uploadError]);

  const handleSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setToast(null);
    dispatch(clearImportSummary());
    try {
      const parsedRows = await parseCsvFile(file);
      setRows(parsedRows);
      setFileName(file.name);
      setMapping(
        getDefaultCsvMapping(
          parsedRows[0] ? Object.keys(parsedRows[0]) : [],
          parsedRows,
        ),
      );
      if (!parsedRows.length)
        setToast({
          tone: "error",
          title: "CSV file is empty",
          message: "The selected CSV file has no rows to import.",
        });
    } catch (error) {
      setRows([]);
      setFileName("");
      setMapping({});
      setToast({
        tone: "error",
        title: "CSV read failed",
        message: error.message || String(error),
      });
    }
  };
  const handleValidate = async () => {
    if (!mappedRows.length) {
      setToast({
        tone: "error",
        title: "Validation blocked",
        message: "Select and map at least one CSV row before validating.",
      });
      return;
    }
    const result = await dispatch(
      validateCsvImport({
        data: { rows: mappedRows, sourceFileName: fileName },
      }),
    ).unwrap();
    const nextAnalysis = result.data || localAnalysis;
    if (nextAnalysis.rowErrors?.length) {
      setToast({
        tone: "error",
        title: "Validation issues found",
        message: `${nextAnalysis.rowErrors.length} issue(s) found in ${fileName || "your mapped file"}. Review the row errors before importing.`,
      });
      return;
    }
    setToast({
      tone: "success",
      title: "Validation complete",
      message: `${fileName || "CSV file"} is ready to import.`,
    });
  };
  const handleImport = async () => {
    if (!mappedRows.length) {
      setToast({
        tone: "error",
        title: "Import blocked",
        message: "Select and map at least one CSV row before importing.",
      });
      return;
    }
    try {
      const response = await dispatch(
        uploadCSV({
          data: {
            rows: mappedRows,
            sourceFileName: fileName,
            analysis: localAnalysis,
            summary: buildImportSummary(mappedRows, localAnalysis),
          },
        }),
      ).unwrap();
      const summary =
        response.meta?.summary || buildImportSummary(mappedRows, localAnalysis);
      setToast({
        tone: "success",
        title: "Import completed",
        message: `Imported ${summary.productsCreated} product(s), ${summary.variantsCreated} variant row(s), and ${summary.attributesCreated} dynamic attribute(s).`,
      });
    } catch (error) {
      setToast({
        tone: "error",
        title: "Import failed",
        message: error.message || String(error),
      });
    }
  };

  return (
    <div className="grid gap-6">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <section className="surface-card grid gap-5 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-2xl font-semibold text-slate-900">
              Upload and map your CSV
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              You can import one product, many products, or many variants in one
              file. If your supplier uses different headers, map them below
              before validating and importing.
            </p>
          </div>
          <label className="btn-primary cursor-pointer">
            <span>Select CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleSelect}
              className="hidden"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="stat-card">
            <strong className="text-3xl font-bold text-slate-900">
              {rows.length}
            </strong>
            <span className="mt-2 block text-sm text-slate-500">
              Rows parsed
            </span>
          </div>
          <div className="stat-card">
            <strong className="text-3xl font-bold text-slate-900">
              {headers.length}
            </strong>
            <span className="mt-2 block text-sm text-slate-500">
              Source columns
            </span>
          </div>
          <div className="stat-card">
            <strong className="text-3xl font-bold text-slate-900">
              {mappingSummary.mappedColumns}
            </strong>
            <span className="mt-2 block text-sm text-slate-500">
              Mapped columns
            </span>
          </div>
          <div className="stat-card">
            <strong className="text-3xl font-bold text-slate-900">
              {mappingSummary.customColumns}
            </strong>
            <span className="mt-2 block text-sm text-slate-500">
              Custom attributes
            </span>
          </div>
        </div>
        <p className="m-0 text-sm text-slate-500">
          {fileName
            ? `${rows.length} rows parsed from ${fileName}`
            : "Choose a CSV to preview columns and begin mapping."}
        </p>
      </section>
      {!!headers.length && (
        <CsvMappingEditor
          headers={headers}
          mapping={mapping}
          onChange={(header, config) =>
            setMapping((current) => ({ ...current, [header]: config }))
          }
        />
      )}
      {!!mappedRows.length && (
        <section className="surface-card grid gap-5 p-6">
          <div>
            <h2 className="m-0 text-2xl font-semibold text-slate-900">
              Mapped preview
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              This is the normalized data that will go into Google Sheet.
              Repeated <code>product_id</code> values will be grouped as
              variants of one product.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <strong>Product columns:</strong>{" "}
              {analysis.coreProductColumns.join(", ") || "None detected"}
            </div>
            <div>
              <strong>Variant columns:</strong>{" "}
              {analysis.coreVariantColumns.join(", ") || "None detected"}
            </div>
            <div>
              <strong>Dynamic attributes:</strong>{" "}
              {analysis.dynamicAttributes.join(", ") || "None detected"}
            </div>
            <div>
              <strong>Unique products:</strong>{" "}
              {analysis.uniqueProductCount || 0}
            </div>
          </div>
          {!!analysis.rowErrors?.length && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
              <strong>Validation issues</strong>
              <ul className="mb-0 mt-3 list-disc space-y-1 pl-5">
                {analysis.rowErrors.slice(0, 10).map((issue, index) => (
                  <li key={`${issue.row}-${issue.field}-${index}`}>
                    Row {issue.row}: {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="table-shell">
            <div className="table-scroll">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {Object.keys(mappedRows[0]).map((key) => (
                      <th key={key} className="th-cell">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.keys(mappedRows[0]).map((key) => (
                        <td key={key} className="td-cell">
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleValidate}
              disabled={validating || !mappedRows.length}
              className="btn-outline"
            >
              {validating ? "Validating..." : "Validate mapped file"}
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={
                busy ||
                !mappedRows.length ||
                Boolean(analysis?.rowErrors?.length)
              }
              className="btn-primary"
            >
              {busy ? "Importing..." : "Import to catalogue"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default ImportDropzone;
