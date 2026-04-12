import { useState, useCallback, useEffect } from 'react';
import api from '../../../services/api.jsx';
import './BusinessJobStyle.css';

function getPageNumbers(currentPage, totalPages) {
    const windowStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
    const end = Math.min(windowStart + 2, totalPages);
    const pages = [];
    for (let i = windowStart; i <= end; i++) pages.push(i);
    return pages;
}

function UpdateTag({ candidate }) {
  return (
      <span className={`statusTag ${candidate.invited ? 'statusTag--open' : 'statusTag--completed'}`}>
          {candidate.invited ? '✓ Interested' : 'Not interested'}
      </span>
  );
}

function CandidateListView({ job, onSelectCandidate, updateCandidateRef }) {
    console.log("onSelectCandidate:", onSelectCandidate);
    const [candidates, setCandidates] = useState([]);
    const [page, setPage]             = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState("");
    const limit = 10;

    // expose this so parent can call it when a candidate changes
    const updateCandidate = (updated) => {
        setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
    };

    // write the function into the ref so parent can access it
    useEffect(() => {
        if (updateCandidateRef) {
            updateCandidateRef.current = updateCandidate;
        }
    }, [updateCandidateRef]);

    const fetchCandidates = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/jobs/${job.id}/candidates`, {
                params: { page, limit }
            });
            setCandidates(data.results);
            setTotalPages(Math.ceil(data.count / limit));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [job.id, page]);

    useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

    const Pagination = () => (
        <div className="pagination">
            {getPageNumbers(page, totalPages).map((p) => (
                <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={p === page ? 'pageNum pageActive' : 'pageNum'}
                >
                    {p}
                </button>
            ))}
        </div>
    );

    return (
        <div>
            {error && <p className="error">{error}</p>}

            {loading ? (
                <div className="spinner" />
            ) : candidates.length === 0 ? (
                <p className="filterHint">There are no valid candidates.</p>
            ) : (
                <>
                    <div className='paginationRes'>
                      <Pagination />
                      <ul className="resultList">
                          {candidates.map(candidate => (
                              <li
                                  key={candidate.id}
                                  onClick={() => {
                                    console.log("candidate clicked:", candidate);
                                    onSelectCandidate(candidate);
                                  }}
                                  className="resultItem"
                              >
                                  <div className="resultCard">
                                      <strong className="resultTitle">
                                          {candidate.first_name} {candidate.last_name}
                                      </strong>
                                      {candidate.qualification_summary && (
                                          <span className="resultSub">{candidate.qualification_summary}</span>
                                      )}
                                      <UpdateTag candidate={candidate} />
                                  </div>
                              </li>
                          ))}
                      </ul>
                      <Pagination />
                    </div>
                </>
            )}
        </div>
    );
}

export default CandidateListView;