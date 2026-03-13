import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProducts } from "../features/catalogueSlice";
import axios from "axios";
import { API } from "../config";

const AdminCataloguePage = () => {
  const dispatch = useDispatch(); const products = useSelector((state) => state.catalogue.products); useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);
  const deleteProduct = async (id) => { await axios.post(API, { action: "delete", id }, { headers: { "Content-Type": "application/json" } }); dispatch(fetchProducts()); };
  if (!products.length) return <div className="page-shell"><div className="surface-card p-6 text-sm text-slate-500">Loading...</div></div>;
  const columns = Object.keys(products[0]);
  return <div className="page-shell"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="m-0 text-3xl font-bold text-slate-900">Data Admin</h2><p className="mt-2 text-sm text-slate-500">Legacy admin table view for sheet-backed records.</p></div><button type="button" className="btn-primary">Create record</button></div><div className="table-shell"><div className="table-scroll"><table className="min-w-[1200px] border-collapse text-sm"><thead><tr>{columns.map((col) => <th key={col} className="th-cell">{col}</th>)}<th className="th-cell">Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.id} className="hover:bg-slate-50/80">{columns.map((col) => <td key={col} className="td-cell">{product[col]}</td>)}<td className="td-cell"><div className="flex flex-wrap gap-2"><Link to={`/record/${product.id}`} className="btn-outline">View</Link><button type="button" className="btn-secondary">Edit</button><button type="button" onClick={() => deleteProduct(product.id)} className="btn-outline text-rose-600 hover:border-rose-200 hover:text-rose-700">Delete</button></div></td></tr>)}</tbody></table></div></div></div>;
};

export default AdminCataloguePage;