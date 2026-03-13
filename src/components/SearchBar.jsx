import React from "react";

const SearchBar = ({ setSearch }) => <input type="text" placeholder="Search products..." onChange={(event) => setSearch(event.target.value)} className="field-input mb-5 max-w-xs" />;

export default SearchBar;