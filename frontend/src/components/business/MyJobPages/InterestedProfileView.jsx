import { useState, useEffect } from 'react';
import api from '../../../services/api.jsx';
import './BusinessJobStyle.css';
import ChatRoom from '../../chatroom/ChatRoom.jsx';

function InterestedProfileView({ job, candidate, onInterestChanged }) {
    const [interested, setInterested]       = useState(candidate.business_interested ?? false);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError]     = useState("");
    const [inChatRoom, setInChatRoom]       = useState(false);
    const [negotiationLoading, setNegotiationLoading] = useState(false);

    const isMutual = candidate.mutual;
    const user = candidate.user;

    const handleToggleInterest = async () => {
        setActionLoading(true);
        setActionError("");
        try {
            await api.patch(`/jobs/${job.id}/candidates/${candidate.user.id}/interested`, {
                interested: !interested
            });
            setInterested(prev => !prev);
            onInterestChanged?.({ ...candidate, business_interested: !interested });
        } catch (err) {
            setActionError("Failed to update interest.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartNegotiation = async () => {
        setNegotiationLoading(true);
        setActionError("");
        try {
            // placeholder API call — replace with real endpoint
            await api.post(`/negotiations`, {
                interest_id: candidate.interest_id
            });

            setInChatRoom(true);
        } catch (err) {
            setActionError("Failed to start negotiation.");
        } finally {
            setNegotiationLoading(false);
        }
    };

    if (inChatRoom) {
        return <ChatRoom />;
    }

    return (
        <div className="detailCard">
            <div className="detailTitleRow">
                <h2 className="detailTitle">{user.first_name} {user.last_name}</h2>
                <span className={`statusTag ${isMutual ? 'statusTag--open' : 'statusTag--completed'}`}>
                    {isMutual ? '✓ Mutual Interest' : 'Not Invited'}
                </span>
            </div>

            <hr />

            {actionError && <p className="modalError">{actionError}</p>}

            <div className="adminActions">
                {isMutual && (
                    <button
                        className="saveBtn"
                        onClick={handleStartNegotiation}
                        disabled={negotiationLoading}
                    >
                        {negotiationLoading ? "Starting..." : "Start Negotiation"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default InterestedProfileView;