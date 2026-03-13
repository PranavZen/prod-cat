import { useNavigate, useLocation } from "react-router-dom";
import qs from "query-string";

const Sort = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = qs.parse(location.search);

  const handleSort = (e) => {
    const newQuery = {
      ...query,
      sort: e.target.value,
    };

    navigate({
      pathname: "/",
      search: qs.stringify(newQuery),
    });
  };

  return (
    <select onChange={handleSort}>
      <option value="">Sort</option>
      <option value="price_asc">Price Low → High</option>
      <option value="price_desc">Price High → Low</option>
    </select>
  );
};

export default Sort;
