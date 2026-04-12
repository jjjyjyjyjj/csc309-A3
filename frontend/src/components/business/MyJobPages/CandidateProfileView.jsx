import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../../context/AuthContext.jsx';
import api from '../../../services/api.jsx';
import './BusinessJobStyle.css';

function CandidateProfileView({ job, candidate, onInterestChanged }) {
    const [details, setDetails]         = useState(null);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState("");
    const [interested, setInterested]   = useState(candidate.business_interested ?? false);
    const [interestId, setInterestId]   = useState(candidate.interest_id ?? null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError]     = useState("");
    const [noShowLoading, setNoShowLoading] = useState(false);
    const [noShowSuccess, setNoShowSuccess] = useState(false);

    useEffect(() => {
        // sync if parent passes a fresh candidate object
        setInterested(candidate.business_interested ?? false);
        setInterestId(candidate.interest_id ?? null);
    }, [candidate.id, candidate.business_interested, candidate.interest_id]);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError("");
            try {
                const { data } = await api.get(`/jobs/${job.id}/candidates/${candidate.id}`);
                setDetails(data);
                // seed interest state from fresh fetch
                if (data.candidate?.interested !== undefined) {
                    setInterested(data.candidate.interested);
                }
                if (data.id) setInterestId(data.id);
            } catch (err) {
                setError("Failed to load candidate details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [job.id, candidate.id]);

    const handleToggleInterest = async () => {
        setActionLoading(true);
        setActionError("");
        try {
            const { data } = await api.patch(
                `/jobs/${job.id}/candidates/${candidate.id}/interested`,
                { interested: !interested }
            );
            // data = { id, job_id, candidate: { id, interested } }
            const newInterested = data.business.interested;
            const newInterestId = data.id;
            setInterested(newInterested);
            setInterestId(newInterestId);
            const updated = {
              ...candidate,
              business_interested: newInterested,
              invited: newInterested,
              interest_id: newInterestId,
          };
            onInterestChanged?.(updated);
        } catch (err) {
            setActionError("Failed to update interest.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartNegotiation = async () => {
        setActionLoading(true);
        setActionError("");
        try {
            await api.post('/negotiations', { interest_id: interestId });
            // TODO: navigate to ChatRoom with interestId / negotiation id
        } catch (err) {
            setActionError("Failed to start negotiation.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleNoShow = async () => {
        setNoShowLoading(true);
        setActionError("");
        try {
            await api.post(`/jobs/${job.id}/no-show`, { candidate_id: candidate.id });
            setNoShowSuccess(true);
        } catch (err) {
            setActionError(err.response?.data?.error || "Failed to mark as no-show.");
        } finally {
            setNoShowLoading(false);
        }
    };

    if (loading) return <div className="spinner" />;
    if (error)   return <p className="error">{error}</p>;
    if (!details) return null;

    const user = details.user;
    const qual = user?.qualification;
    const jobStatus = details.job?.status;
    const jobStarted = details.job?.start_time
        ? new Date(details.job.start_time) <= new Date()
        : false;
    const isFilled  = jobStatus === 'filled';
    const showNoShow = isFilled && jobStarted;

    return (
        <div className="detailCard">
            <div className="detailTitleRow">
                <h2 className="detailTitle">{user.first_name} {user.last_name}</h2>
            </div>

            <hr />

            <ul className="detailList">
                <li><strong>Biography:</strong> {user.biography || "N/A"}</li>

                {qual && (
                    <>
                        <li><strong>Qualification Note:</strong> {qual.note || "N/A"}</li>
                        {qual.document && (
                            <li>
                                <strong>Qualification Document:</strong>{" "}
                                <a href={`${BACKEND_URL}/${qual.document}`} target="_blank" rel="noreferrer">View PDF</a>
                            </li>
                        )}
                    </>
                )}

                {user.resume && (
                    <li>
                        <strong>Resume:</strong>{" "}
                        <a href={`${BACKEND_URL}/${user.resume}`} target="_blank" rel="noreferrer">View PDF</a>
                    </li>
                )}

                {isFilled && (
                    <>
                        <li><strong>Email:</strong> {user.email}</li>
                        <li><strong>Phone:</strong> {user.phone_number}</li>
                    </>
                )}
            </ul>

            {actionError && <p className="modalError">{actionError}</p>}
            {noShowSuccess && <p className="successToast">Marked as no-show.</p>}

            <div className="adminActions">
                {/* Toggle interest */}
                <button
                    className={interested ? "deleteBtn" : "editBtn"}
                    onClick={handleToggleInterest}
                    disabled={actionLoading}
                >
                    {actionLoading ? "Updating..." : interested ? "Revoke Interest" : "Express Interest"}
                </button>

                {/* Start negotiation — only when business is interested */}
                {interested && interestId && (
                    <button
                        className="editBtn"
                        onClick={handleStartNegotiation}
                        disabled={actionLoading}
                    >
                        Start Negotiations
                    </button>
                )}
            </div>
        </div>
    );
}

export default CandidateProfileView;