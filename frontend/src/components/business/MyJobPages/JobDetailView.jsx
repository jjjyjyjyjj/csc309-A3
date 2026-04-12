import { useState, useRef } from 'react';
import api from '../../../services/api.jsx';
import CandidateListView from './CandidateListView.jsx';
import CandidateProfileView from './CandidateProfileView.jsx';
import InterestedUsersView from './InterestedUsersView.jsx';
import InterestedProfileView from './InterestedProfileView.jsx';
import './BusinessJobStyle.css';

function JobDetailView({ job, onJobUpdated, onJobDeleted }) {
    const [isModalOpen, setIsModalOpen]         = useState(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const [loading, setLoading]                 = useState(false);
    const [error, setError]                     = useState("");
    const [deleteError, setDeleteError]         = useState("");
    const [updateNote, setUpdateNote]           = useState("");
    const [updateMinSal, setUpdateMinSal]       = useState("");
    const [updateMaxSal, setUpdateMaxSal]       = useState("");
    const [updateStartTime, setUpdateStartTime] = useState("");
    const [updateEndTime, setUpdateEndTime]     = useState("");
    const [successMessage, setSuccessMessage]   = useState("");
    const [activePanel, setActivePanel]         = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedUser, setSelectedUser]           = useState(null);
    const [noShowLoading, setNoShowLoading]     = useState(false);
    const [noShowSuccess, setNoShowSuccess]     = useState(false);
    const [noShowError, setNoShowError]         = useState("");
    const updateCandidateRef = useRef(null);

    // derived values from job prop directly
    const jobStarted = job.start_time
        ? new Date(job.start_time) <= new Date()
        : false;
    const isFilled   = job.status === 'filled';
    const showNoShow = isFilled && jobStarted && !noShowSuccess;

    const togglePanel = (panel) => {
        setActivePanel(prev => prev === panel ? null : panel);
        setSelectedCandidate(null);
        setSelectedUser(null);
    };

    const openUpdateModal = () => {
        setUpdateNote(job.note || "");
        setUpdateMinSal(job.salary_min || "");
        setUpdateMaxSal(job.salary_max || "");
        setUpdateStartTime("");
        setUpdateEndTime("");
        setError("");
        setIsModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const payload = {
                salary_min: Number(updateMinSal),
                salary_max: Number(updateMaxSal),
                note: updateNote,
                ...(updateStartTime && { start_time: new Date(updateStartTime).toISOString() }),
                ...(updateEndTime   && { end_time:   new Date(updateEndTime).toISOString() }),
            };
            await api.patch(`/businesses/me/jobs/${job.id}`, payload);
            setIsModalOpen(false);
            setSuccessMessage("Job updated successfully.");
            setTimeout(() => setSuccessMessage(""), 3000);
            onJobUpdated?.();
        } catch (err) {
            console.log(err.response?.data);
            setError("Update failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setDeleteError("");
        try {
            await api.delete(`/businesses/me/jobs/${job.id}`);
            onJobDeleted?.();
        } catch (err) {
            if (err.response?.status === 409) {
                setDeleteError("This job cannot be deleted because it is not open or expired, or it has an active negotiation.");
            } else {
                setDeleteError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNoShow = async () => {
        setNoShowLoading(true);
        setNoShowError("");
        try {
            await api.patch(`/jobs/${job.id}/no-show`);
            setNoShowSuccess(true);
        } catch (err) {
            setNoShowError(err.response?.data?.error || "Failed to mark as no-show.");
        } finally {
            setNoShowLoading(false);
        }
    };

    const renderRightPanel = () => {
        if (selectedCandidate) {
            return (
                <CandidateProfileView
                    job={job}
                    candidate={selectedCandidate}
                    onInterestChanged={(updated) => {
                        setSelectedCandidate(updated);
                        updateCandidateRef.current?.(updated);
                    }}
                />
            );
        }
        if (selectedUser) {
            return (
                <InterestedProfileView
                    job={job}
                    candidate={selectedUser}
                    onInterestChanged={(updated) => setSelectedCandidate(updated)}
                />
            );
        }
        return (
            <div className="emptyDetailState">
                <p>Select an item from the list to view details.</p>
            </div>
        );
    };

    // console.log("isFilled:", isFilled, "jobStarted:", jobStarted, "noShowSuccess:", noShowSuccess, "job.status:", job.status, "job.start_time:", job.start_time);

    return (
        <div className="detailCard job">
            {successMessage && <div className="successToast">{successMessage}</div>}

            <div className="detailTitleRow">
                <h2 className="detailTitle">{job.positionType.name}</h2>
                <span className={`statusTag statusTag--${job.status}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
            </div>

            <hr />

            <div className="detailBody job">
                <ul className="detailList">
                    <li>Salary: ${job.salary_min} - ${job.salary_max} / hr</li>
                    <li>Start: {job.start_time ? new Date(job.start_time).toLocaleDateString() : "N/A"}</li>
                    <li>End: {job.end_time ? new Date(job.end_time).toLocaleDateString() : "N/A"}</li>
                    <li>Last updated: {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : "N/A"}</li>
                    <li>Worker: {job.worker ? `${job.worker.first_name} ${job.worker.last_name}` : "Unassigned"}</li>
                    {job.note && <li>Note: {job.note}</li>}
                    {job.description && <li>{job.description}</li>}
                </ul>

                <div className="detailActions">
                    {(job.status === "open" || job.status === "expired") && (
                        <>
                            <button className="editBtn" onClick={openUpdateModal}>Edit</button>
                            <button className="deleteBtn" onClick={() => { setIsDeleteConfirm(true); setDeleteError(""); }}>
                                Delete
                            </button>
                        </>
                    )}

                    {/* ── No-show: filled jobs that have started ── */}
                   
                    {showNoShow && (
                        <button
                            className="deleteBtn"
                            onClick={handleNoShow}
                            disabled={noShowLoading}
                        >
                            {noShowLoading ? "Marking..." : "Mark as No-Show"}
                        </button>
                    )}
                    {noShowSuccess && <p className="filterHint">Marked as no-show.</p>}
                    {noShowError && <p className="modalError">{noShowError}</p>}
                </div>
            </div>

            {/* ── Panel toggle buttons ── */}
            {job.status === "open" && (
                <div>
                    <hr className='shadowDivide' />
                    <div className="detailNav">
                        <button
                            className={`detailNavBtn ${activePanel === 'candidates' ? 'detailNavBtnActive' : ''}`}
                            onClick={() => togglePanel('candidates')}
                        >
                            Candidates <span className="detailNavArrow">{activePanel === 'candidates' ? '▾' : '▸'}</span>
                        </button>
                        <button
                            className={`detailNavBtn ${activePanel === 'interested' ? 'detailNavBtnActive' : ''}`}
                            onClick={() => togglePanel('interested')}
                        >
                            Interested Users <span className="detailNavArrow">{activePanel === 'interested' ? '▾' : '▸'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ── Two panel layout when a dropdown is open ── */}
            {activePanel && (
                <div className="results">
                    <ul className="resultList">
                        {activePanel === 'candidates' && (
                            <CandidateListView
                                job={job}
                                updateCandidateRef={updateCandidateRef}
                                onSelectCandidate={(c) => {
                                    setSelectedCandidate(c);
                                    setSelectedUser(null);
                                }}
                            />
                        )}
                        {activePanel === 'interested' && (
                            <InterestedUsersView
                                job={job}
                                selectedUser={selectedUser}
                                onSelectUser={(u) => {
                                    setSelectedUser(u);
                                    setSelectedCandidate(null);
                                }}
                            />
                        )}
                    </ul>
                    <div className="detailPanel">
                        {renderRightPanel()}
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {isDeleteConfirm && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <h3 className="modalTitle">Delete Job Post</h3>
                        <p className="modalWarning">
                            Are you sure you want to delete <strong>{job.positionType.name}</strong>?
                            This will remove all associated interests and negotiations and cannot be undone.
                        </p>
                        {deleteError && <p className="modalError">{deleteError}</p>}
                        <div className="modalActions">
                            <button
                                className="modalCancelBtn"
                                onClick={() => { setIsDeleteConfirm(false); setDeleteError(""); }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button className="deleteBtn" onClick={handleDelete} disabled={loading}>
                                {loading ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {isModalOpen && (
                <div className="modalOverlay">
                    <div className="modalContent">
                        <h3 className="modalTitle">Edit {job.positionType.name}</h3>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="formGroup">
                                <label className="filterLabel">Note</label>
                                <textarea
                                    className="modalTextarea"
                                    value={updateNote}
                                    onChange={(e) => setUpdateNote(e.target.value)}
                                    placeholder="Explain your changes..."
                                />
                            </div>
                            <div className="filterRow">
                                <div className="filterInputGroup">
                                    <label className="filterSubLabel">Min Salary ($/hr)</label>
                                    <input type="number" min={0} className="filterSelect" value={updateMinSal} onChange={(e) => setUpdateMinSal(e.target.value)} />
                                </div>
                                <div className="filterInputGroup">
                                    <label className="filterSubLabel">Max Salary ($/hr)</label>
                                    <input type="number" min={0} className="filterSelect" value={updateMaxSal} onChange={(e) => setUpdateMaxSal(e.target.value)} />
                                </div>
                            </div>
                            <div className="filterRow">
                                <div className="filterInputGroup">
                                    <label className="filterSubLabel">Start Time</label>
                                    <input type="datetime-local" className="filterSelect" value={updateStartTime} onChange={(e) => setUpdateStartTime(e.target.value)} />
                                </div>
                                <div className="filterInputGroup">
                                    <label className="filterSubLabel">End Time</label>
                                    <input type="datetime-local" className="filterSelect" value={updateEndTime} onChange={(e) => setUpdateEndTime(e.target.value)} />
                                </div>
                            </div>
                            {error && <p className="modalError">{error}</p>}
                            <div className="modalActions">
                                <button type="button" className="modalCancelBtn" onClick={() => setIsModalOpen(false)} disabled={loading}>Cancel</button>
                                <button type="submit" className="saveBtn" disabled={loading}>
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobDetailView;