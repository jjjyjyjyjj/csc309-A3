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

function InterestedUsersView({ job, onSelectUser }) {
    const [users, setUsers]           = useState([]);
    const [page, setPage]             = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState("");
    const [selectedUser, setSelectUser] = useState("");
    const limit = 10;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get(`/jobs/${job.id}/interests`, {
                params: { page, limit }
            });
            console.log(data.results);
            setUsers(data.results);
            setTotalPages(Math.ceil(data.count / limit));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [job.id, page]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const Pagination = () => (
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
    );

    return (
        <div>
            {error && <p className="error">{error}</p>}

            {loading ? (
                <div className="spinner" />
            ) : users.length === 0 ? (
                <p className="filterHint">No users have expressed interest yet.</p>
            ) : (
                <>
                  <div className='paginationRes'>
                      <Pagination />
                        <ul className="resultList">
                        {users.map(user => (
                            <li 
                                key={user.interest_id} 
                                className={`resultItem ${selectedUser?.interest_id === user.interest_id ? 'resultItemActive' : ''}`}
                                onClick={() => {
                                  setSelectUser(user); 
                                  onSelectUser(user);
                                  console.log("clicked interested user");
                                }}
                            >
                                <div className="resultCard">
                                    <strong className="resultTitle">
                                        {user.user.first_name} {user.user.last_name}
                                    </strong>
                                    <span className={`statusTag ${user.mutual ? 'statusTag--open' : 'statusTag--completed'}`}>
                                        {user.mutual ? '✓ Mutual Interest' : 'Not Invited'}
                                    </span>
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

export default InterestedUsersView;