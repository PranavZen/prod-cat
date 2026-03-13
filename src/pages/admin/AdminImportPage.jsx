import { useSelector } from "react-redux";
import ImportDropzone from "../../admin/import/ImportDropzone";
import { selectImportSummary } from "../../store/catalogueSlice";

const AdminImportPage = () => {
  const summary = useSelector(selectImportSummary);
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="m-0 text-3xl font-bold text-slate-900">
          CSV Import Studio
        </h1>
        <p className="m-0 max-w-4xl text-sm leading-7 text-slate-500">
          Upload supplier files, map unfamiliar column names, validate rows, and
          import one or many product variants into your catalogue.
        </p>
      </div>
      <ImportDropzone />
      {summary && (
        <div className="grid gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-700">
          <strong>Latest import summary</strong>
          <span>
            Imported {summary.productsCreated} products,{" "}
            {summary.variantsCreated} variants, and {summary.attributesCreated}{" "}
            dynamic attributes.
          </span>
          {summary.analysis?.dynamicAttributes?.length ? (
            <span>
              Dynamic attributes detected:{" "}
              {summary.analysis.dynamicAttributes.join(", ")}.
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AdminImportPage;
