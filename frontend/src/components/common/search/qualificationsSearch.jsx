import { useState, useRef } from 'react';
import { BACKEND_URL } from '../../../context/AuthContext';
import api from '../../../services/api';
import SearchPage from './search';
import './style.css';

const qualificationsParamBuilder = (query, page, limit) => ({
    ...(query && { keyword: query }),
    page,
    limit
  });

function QualificationsSearchPage() {
  const onUpdate = useRef(null);
  const [editTarget, setEditTarget] = useState(null);   // which q is being edited
  const [editStatus, setEditStatus] = useState("");

  const openEditModal = (q) => {
    setEditTarget(q);
    setEditStatus(q.status);
  };  

  const handleReviseQual = async() =>{
    try {
      await api.patch(`/qualifications/${editTarget.id}`,{
        status: editStatus
      })
      const updated = { ...editTarget, status: editStatus};
      onUpdate.current?.(updated); // update in place
      setEditTarget(null);
    } catch (err) {
      console.error("Failed to edit position type", err);
    }
    }

  return (
    <>
    {editTarget && (
      <>
        <div className="modalOverlay">
          <div className="modalBox">
            <h2>Edit Qualification</h2>
            <label>Status</label>
            <input
              placeholder='approved or rejected'
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="modalInput"
            />
            <div className="modalActions">
              <button onClick={handleReviseQual} className="edit-btn">Save</button>
              <button onClick={() => setEditTarget(null)} className="delete-btn">Cancel</button>
            </div>
          </div>
        </div>
        </>
      )}

      <SearchPage
        onItemUpdate={onUpdate}
        apiEndpoint="/qualifications"
        placeholder="Search qualifications..."
        paramBuilder={qualificationsParamBuilder}
        extraFilters={{}}

        renderResult={(q) => (
          <div className="resultCard">
            <strong className='resultTitle'>{q.position_type?.name || "Unknown Position"}</strong>
            <span className='resultSub'>User: {q.user ? `${q.user.first_name} ${q.user.last_name}` : "N/A"}</span>
          </div>)}

        renderDetail={(q) => (
          <div className="detailCard">
            <h2 className="detailTitle">{q.position_type?.name || "Unknown Position"}</h2>
            <hr />
            <ul className='detailList'>
              <li>User: {q.user ? `${q.user.first_name} ${q.user.last_name}` : "N/A"}</li>
              <li>Qualification Document: {q.document ? (
                <iframe 
                    src={`${BACKEND_URL}/${q.document}`}
                    width="100%"
                    height="500px"
                    title="Document Preview"
                  />) : "N/A"}</li>
              <li>Status: {q.status}</li>
            </ul>
            <div className="position-actions">
              <button 
                className="revise-btn" 
                onClick={() => openEditModal(q)}
              >
                Revise
              </button>
            </div>
          </div>)} 
      />
      </>
  );
}

export default QualificationsSearchPage;