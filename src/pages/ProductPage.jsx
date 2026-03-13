import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getRecordTitle,
  getRecordImageUrl,
  getKeysToHideFromDetail,
} from "../utils/recordHelpers";
import {
  fetchProductById,
  selectProductDetailById,
  selectLoadingByAction,
} from "../store/catalogueSlice";

const ProductPage = () => {
  // this page is a lightweight record detail view used by admin links (`/record/:productId`)
  const { productId } = useParams();
  const dispatch = useDispatch();

  const detail = useSelector((state) =>
    selectProductDetailById(state, productId),
  );
  const loading = useSelector(selectLoadingByAction("fetchProductById"));
  const record = detail?.product || null;

  // fetch if we don’t already have the detail for the requested id
  useEffect(() => {
    if (
      !record ||
      String(record.product_id || record.id) !== String(productId)
    ) {
      dispatch(fetchProductById({ data: { product_id: productId } }));
    }
  }, [dispatch, productId, record]);

  if (loading && !record) {
    return (
      <div className="page-shell">
        <div className="surface-card p-6 text-sm text-slate-500">
          Loading record…
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="page-shell">
        <div className="surface-card p-6 text-sm text-slate-500">
          Record not found.
        </div>
      </div>
    );
  }

  const title = getRecordTitle(record);
  const imageUrl = getRecordImageUrl(record);
  const keysToHide = getKeysToHideFromDetail(record);

  return (
    <div className="page-shell max-w-4xl">
      <Link to="/" className="btn-ghost w-fit">
        ← Back to list
      </Link>
      <div className="surface-card grid gap-6 p-6 sm:p-8">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            className="w-full max-w-sm rounded-3xl bg-slate-100 object-cover"
          />
        )}
        <div>
          <h1 className="m-0 text-3xl font-bold text-slate-900">{title}</h1>
          <dl className="mt-6 grid gap-4">
            {Object.entries(record).map(([key, value]) => {
              if (keysToHide.has(key) || value == null || value === "")
                return null;
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <dt className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {key}
                  </dt>
                  <dd className="m-0 mt-2 text-sm text-slate-700">
                    {String(value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
