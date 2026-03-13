import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import qs from "query-string";

const Filters = () => {
  const navigate = useNavigate(); const location = useLocation(); const products = useSelector((state) => state.catalogue.products); const query = qs.parse(location.search); const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
  const setCategory = (category) => navigate({ pathname: "/", search: qs.stringify({ ...query, category }) });
  return <div className="mb-5 flex flex-wrap gap-2.5"><button type="button" onClick={() => setCategory("")} className="btn-outline">All</button>{categories.map((category) => <button key={category} type="button" onClick={() => setCategory(category)} className="btn-outline">{category}</button>)}</div>;
};

export default Filters;