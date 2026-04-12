import { useEffect, useState, useCallback } from "react";
import { useAuth } from '../../context/AuthContext';
import api from "../../services/api";
import './invitations.css';

function getPageNumbers(currentPage, totalPages) {
    const windowStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
    const end = Math.min(windowStart + 2, totalPages);
    const pages = [];
    for (let i = windowStart; i <= end; i++) pages.push(i);
    return pages;
}

export default function Invitations() {
    const { user, authLoading } = useAuth();
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [results, setResults]       = useState([]);
    const [page, setPage]             = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    const fetchInvitations = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get("/users/me/invitations", { params: { page, limit } });
            setResults(res.data.results || res.data);
            setTotalPages(Math.ceil((res.data.count ?? res.data.length) / limit));
            if (res.data.results?.length > 0) setSelectedItem(res.data.results[0]);
        } catch (err) {
            setError("Failed to load invitations.");
        } finally {
            setLoading(false);
        }
    }, [user, page]);

    useEffect(() => {
        if (!authLoading) fetchInvitations();
    }, [authLoading, fetchInvitations]);

    const handleInterest = async (jobId, interested) => {
        try {
            await api.patch(`/jobs/${jobId}/interested`, { interested });
            fetchInvitations();
        } catch (err) {
            setError("Action failed. Please try again.");
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
                    <p className="filterHint" style={{ padding: '16px' }}>You have no invitations yet.</p>
                ) : (
                    <>
                        <Pagination />
                        <ul className="resultList">
                            {results.map((item) => (
                                <li
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={selectedItem?.id === item.id ? 'resultItem resultItemActive' : 'resultItem'}
                                >
                                    <div className="resultCard">
                                        <strong className="resultTitle">{item.business.business_name}</strong>
                                        <span className="resultSub">{item.position_type.name}</span>
                                        <span className="statusTag statusTag--open">Invited</span>
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
                        <h2 className="detailTitle">{selectedItem.business.business_name}</h2>
                        <span className="statusTag statusTag--open">Invited</span>
                    </div>

                    <hr />

                    <ul className="detailList">
                        <li><strong>Position:</strong> {selectedItem.position_type.name}</li>
                        <li><strong>Salary:</strong> ${selectedItem.salary_min} – ${selectedItem.salary_max}/hr</li>
                        <li><strong>Start:</strong> {new Date(selectedItem.start_time).toLocaleDateString()}</li>
                        <li><strong>End:</strong> {new Date(selectedItem.end_time).toLocaleDateString()}</li>
                    </ul>

                    {error && <p className="modalError">{error}</p>}

                    <div className="adminActions">
                        <button className="editBtn" onClick={() => handleInterest(selectedItem.id, true)}>
                            Accept Invitation
                        </button>
                        <button className="deleteBtn" onClick={() => handleInterest(selectedItem.id, false)}>
                            Decline
                        </button>
                    </div>
                </div>
            ) : (
                <div className="intDetailPanel" style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <p className="filterHint">Select an invitation to view details.</p>
                </div>
            )}
        </div>
    );
}