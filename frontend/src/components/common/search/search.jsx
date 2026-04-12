import { useState, useEffect, useCallback } from 'react';
import './search.css';
import { BACKEND_URL } from '../../../context/AuthContext';
import api from '../../../services/api'

// helper functions for pagination
function getPageNumbers(currentPage, totalPages) {
  // figure out which window of 3 we're in and show those pages
  const windowStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
  const end = Math.min(windowStart + 2, totalPages);
  const pages = [];
  for (let i = windowStart; i <= end; i++) pages.push(i);
  return pages;
}

function getNextWindowStart(currentPage, totalPages) {
  const windowStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
  return windowStart + 3; // start of next window
}

function SearchPage({
  apiEndpoint,
  renderResult,
  renderDetail,
  paramBuilder,        // { q: query, page, limit, ...extraFilters }
  limit = 10,
  placeholder = "Search...",
  extraFilters = {},
  onItemUpdate,    
}) {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState([]);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchResults = useCallback(async () => {
  setLoading(true);
  setError("");
  try {
    const params = paramBuilder(query, page, limit, extraFilters);
    const { data } = await api.get(apiEndpoint, { params }); // ← axios params object
    setResults(data.results);
    setTotalPages(Math.ceil(data.count / limit));
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [apiEndpoint, query, page, limit, paramBuilder, extraFilters]);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [extraFilters]);

   useEffect(() => {
    if (onItemUpdate) {
      onItemUpdate.current = (updatedItem) => {
        setSelectedItem(updatedItem);
        setResults(prev => prev.map(r => r.id === updatedItem.id ? updatedItem : r));
      };
    }
  }, [onItemUpdate]);

  useEffect(() => { fetchResults(); }, [query, page, extraFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(inputValue);
  };

  return (
    <div className="searchPage">
      <form onSubmit={handleSearch} className='searchBar'>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="searchInput"
        />
        <button type="submit" className="searchButton">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error  && <p className="error">{error}</p>}
      {totalPages > 1 && (
        <div className="pagination">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className='pageNum'>{'<'}</button>
        {getPageNumbers(page, totalPages).map((p) => (
            <button
                key={p}
                onClick={() => setPage(p)}
                className={p === page ? 'pageNum pageActive' : 'pageNum'}
            >
                {p}
            </button>
        ))}
        <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className='pageNum'>{'>'}</button>
    </div>
      )}
      <div className="results">
        <ul className='resultList'>
          {results.map((item, i) => (
            <li key={item.id ?? i} 
            // when click set as sleected item 
              onClick={() => setSelectedItem(item)}
              className={selectedItem?.id === item.id ? 'resultItemActive' : ''}>
              {renderResult(item)}
            </li>
          ))}
        </ul>
        <div className="detailPanel">
            {selectedItem ? (
              // item selected -> show the specific detail
              renderDetail(selectedItem)
            ) : (
              // nothing selected -> show empty state
              <div className="emptyDetailState">
                <h3>No Item Selected</h3>
                <p>Please select an item from the list to view details.</p>
              </div>
            )}
            </div>
          </div>

        {totalPages > 1 && (
        <div className="pagination">
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className='pageNum'>{'<'}</button>
        {getPageNumbers(page, totalPages).map((p) => (
            <button
                key={p}
                onClick={() => setPage(p)}
                className={p === page ? 'pageNum pageActive' : 'pageNum'}
            >
                {p}
            </button>
        ))}
        <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className='pageNum'>{'>'}</button>
    </div>

      )}
    </div>
  );
}

export default SearchPage;