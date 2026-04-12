import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api.jsx';
import './BusinessJobStyle.css';

const jobParamBuilder = (page, limit, filters) => ({
    ...(filters.sort       && { sort: filters.sort }),
    ...(filters.order      && { order: filters.order }),
    ...(filters.status     && { status: filters.status }),
    ...(filters.salary_min !== undefined && { salary_min: filters.salary_min }),
    ...(filters.salary_max !== undefined && { salary_max: filters.salary_max }),
    ...(filters.start_time && { start_time: filters.start_time }),
    ...(filters.end_time   && { end_time: filters.end_time }),
    page,
    limit,
});

function getPageNumbers(currentPage, totalPages) {
    const windowStart = Math.floor((currentPage - 1) / 3) * 3 + 1;
    const end = Math.min(windowStart + 2, totalPages);
    const pages = [];
    for (let i = windowStart; i <= end; i++) pages.push(i);
    return pages;
}

function getNextWindowStart(currentPage) {
    return Math.floor((currentPage - 1) / 3) * 3 + 4;
}

function JobListView({ onSelectJob }) {
    const [jobs, setJobs]             = useState([]);
    const [page, setPage]             = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState("");
    const limit = 10;

    // "draft" filters — what the user is currently typing/selecting
    // but hasn't submitted yet
    const [draftFilters, setDraftFilters] = useState({
        sort: "",
        order: "asc",
        status: "",
        salary_min: undefined,
        salary_max: undefined,
        start_time: "",
        end_time: "",
    });

    // "applied" filters — what was last submitted, these actually
    // drive the API call
    const [appliedFilters, setAppliedFilters] = useState({
        sort: "",
        order: "asc",
        status: "",
        salary_min: undefined,
        salary_max: undefined,
        start_time: "",
        end_time: "",
    });

    const setDraft = (key, value) =>
        setDraftFilters(prev => ({ ...prev, [key]: value }));

    // When the user clicks Apply, copy draft into applied and reset to page 1
    const handleApply = () => {
        setAppliedFilters(draftFilters);
        setPage(1);
    };

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const params = jobParamBuilder(page, limit, appliedFilters);
            const { data } = await api.get('/businesses/me/jobs', { params });
            setJobs(data.results);
            console.log(data.results);
            setTotalPages(Math.ceil(data.count / limit));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, appliedFilters]);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    return (
        <div>
            {/* ── Filter Form ── */}
            {/*
                This is NOT a <form> tag because submitting a form causes a
                page reload. Instead we use a plain div and an onClick button.
            */}
            <div className="filters">

            <div className="filterRow">
                <div className="filterGroup">
                    <label className="filterLabel">Sort By</label>
                    <div className="filterRow">
                        <select
                            value={draftFilters.sort}
                            onChange={(e) => setDraft('sort', e.target.value)}
                            className='filterSelect'
                        >
                            <option value="">No sort</option>
                            <option value="salary">Salary</option>
                            <option value="start_time">Start Time</option>
                            <option value="end_time">End Time</option>
                        </select>

                        {draftFilters.sort !== "" && (
                            <select
                                value={draftFilters.order}
                                onChange={(e) => setDraft('order', e.target.value)}
                                className='filterSelect'
                            >
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        )}
                    </div>
                </div>

                <div className="filterVerticalDivider" />

                <div className="filterGroup">
                    <label className="filterLabel">Status</label>
                    <select
                        value={draftFilters.status}
                        onChange={(e) => setDraft('status', e.target.value || undefined)}
                        className='filterSelect'
                    >
                        <option value="">All statuses</option>
                        <option value="open">Open</option>
                        <option value="filled">Filled</option>
                        <option value="canceled">Canceled</option>
                        <option value="completed">Completed</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
            </div>

            <div className="filterHorizontalDivider" />


                <div className="filterGroup">
                    <label className="filterLabel">Hourly Salary Range</label>
                    <p className="filterHint">Show jobs where salary minimum is at least and salary maximum is at least the values below</p>
                    <div className="filterRow">
                        <div className="filterInputGroup">
                            <label className="filterSubLabel">Min salary at least</label>
                            <input
                                type="number"
                                placeholder="e.g. 20"
                                min={0}
                                className="filterSelect"
                                value={draftFilters.salary_min ?? ""}
                                onChange={(e) => setDraft('salary_min', e.target.value === "" ? undefined : Number(e.target.value))}
                            />
                        </div>
                        <div className="filterInputGroup salary">
                            <label className="filterSubLabel">Max salary at least</label>
                            <input
                                type="number"
                                placeholder="e.g. 40"
                                min={0}
                                className="filterSelect"
                                value={draftFilters.salary_max ?? ""}
                                onChange={(e) => setDraft('salary_max', e.target.value === "" ? undefined : Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                <div className="filterHorizontalDivider" />

                <div className="filterGroup date">
                    <label className="filterLabel">Date Range</label>
                    <div className="filterRow">
                        <div className="filterInputGroup">
                            <label className="filterSubLabel">Start date</label>
                            <input
                                type="date"
                                className="filterSelect"
                                value={draftFilters.start_time}
                                onChange={(e) => setDraft('start_time', e.target.value)}
                            />
                        </div>
                        <div className="filterInputGroup">
                            <label className="filterSubLabel">End date</label>
                            <input
                                type="date"
                                className="filterSelect"
                                value={draftFilters.end_time}
                                onChange={(e) => setDraft('end_time', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="filterGroup">
                    <button className="searchButton" onClick={handleApply}>
                        Apply Filters
                    </button>
                </div>

            </div>


            {/* ── Job List ── */}
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

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

            <div className="filterHorizontalDivider" />

            <ul className='resultList'>
                {jobs.map(job => (
                    <li key={job.id} onClick={() => onSelectJob(job)} className='resultItem'>
                        <div className="resultCard">
                            <strong className="resultTitle">{job.positionType.name}</strong>
                            <span className="resultSub">${job.salary_min} - ${job.salary_max} / hr</span>
                            {job.status === 'filled' && job.worker && (
                                <span className="resultSub">
                                    Worker: {job.worker.first_name} {job.worker.last_name}
                                </span>
                            )}
                            <span className={`statusTag statusTag--${job.status}`}>
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="filterHorizontalDivider" />

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

        </div>
    );
}

export default JobListView;
