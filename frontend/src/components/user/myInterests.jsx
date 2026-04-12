
import { useEffect, useState, useCallback } from "react";
import { useAuth } from '../../context/AuthContext';
import api from "../../services/api";
import './interests.css';

function getPageNumbers(currentPage, totalPages) {
    const windowStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
    const end = Math.min(windowStart + 2, totalPages);
    const pages = [];
    for (let i = windowStart; i <= end; i++) pages.push(i);
    return pages;
}

export default function Interests() {
    const { user, authLoading } = useAuth();
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [results, setResults]       = useState([]);
    const [page, setPage]             = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const fetchInterests = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get("/users/me/interests", { params: { page, limit } });
            setResults(res.data.results || res.data);
            setTotalPages(Math.ceil((res.data.count ?? res.data.length) / limit));
            if (res.data.results?.length > 0) setSelectedItem(res.data.results[0]);
        } catch (err) {
            setError("Failed to load interests.");
        } finally {
            setLoading(false);
        }
    }, [user, page]);

    useEffect(() => {
        if (!authLoading) fetchInterests();
    }, [authLoading, fetchInterests]);

    const handleNego = async (item) => {
        try {
            await api.post('/negotiations', { interest_id: item.interest_id });
        } catch (err) {
            setError("Failed to start negotiation.");
        }
    };

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

    if (authLoading || loading) return <div className="spinner" />;

    return (
        <div className="interestsPage">

            {/* Left list */}
            <div className="intListContainer">
                {results.length === 0 ? (
                    <p className="filterHint" style={{ padding: '16px' }}>You have no interests yet.</p>
                ) : (
                    <>
                        <Pagination />
                        <ul className="resultList">
                            {results.map((item) => (
                                <li
                                    key={item.interest_id}
                                    onClick={() => setSelectedItem(item)}
                                    className={selectedItem?.interest_id === item.interest_id ? 'resultItem resultItemActive' : 'resultItem'}
                                >
                                    <div className="resultCard">
                                        <strong className="resultTitle">{item.job.business.business_name}</strong>
                                        <span className="resultSub">{item.job.position_type.name}</span>
                                        <span className={`statusTag ${item.mutual ? 'statusTag--open' : 'statusTag--completed'}`}>
                                            {item.mutual ? 'Mutual Interest' : 'Pending'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Pagination />
                    </>
                )}
            </div>

            {/* Right detail */}
            {selectedItem ? (
                <div className="intDetailPanel">
                    <div className="detailTitleRow">
                        <h2 className="detailTitle">{selectedItem.job.business.business_name}</h2>
                        <span className={`statusTag ${selectedItem.mutual ? 'statusTag--open' : 'statusTag--completed'}`}>
                            {selectedItem.mutual ? 'Mutual Interest' : 'Pending'}
                        </span>
                    </div>

                    <hr />

                    <ul className="detailList">
                        <li><strong>Position:</strong> {selectedItem.job.position_type.name}</li>
                        <li><strong>Salary:</strong> ${selectedItem.job.salary_min} – ${selectedItem.job.salary_max}/hr</li>
                        <li><strong>Start:</strong> {new Date(selectedItem.job.start_time).toLocaleDateString()}</li>
                        <li><strong>End:</strong> {new Date(selectedItem.job.end_time).toLocaleDateString()}</li>
                    </ul>

                    {error && <p className="modalError">{error}</p>}

                    <div className="adminActions">
                        {selectedItem.mutual ? (
                            <button className="editBtn" onClick={() => handleNego(selectedItem)}>
                                Start Negotiation
                            </button>
                        ) : (
                            <p className="filterHint">The business has not shown interest yet.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="intDetailPanel" style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <p className="filterHint">Select an interest to view details.</p>
                </div>
            )}
        </div>
    );
}