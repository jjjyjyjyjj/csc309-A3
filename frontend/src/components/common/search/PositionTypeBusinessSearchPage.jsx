import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../services/api';
import SearchPage from './search';
import './style.css';

const positionTypeParamBuilder = (query, page, limit, filters) => ({
  ...(query && { keyword: query }),
  ...(filters.name && { name: filters.name }),
  ...(filters.num_qualified && { num_qualified: filters.num_qualified }),
  ...(filters.hidden !== undefined && { hidden: filters.hidden }),
  page,
  limit,
});

function CreateJobModal({ positionType, onClose }) {
    const [form, setForm] = useState({
      salary_min: '',
      salary_max: '',
      start_time: '',
      end_time: '',
      note: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
  
    const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  
    const handleSubmit = async () => {
      setError(null);
  
      const now = new Date();
    const start = new Date(form.start_time + 'T00:00:00');
    const end = new Date(form.end_time + 'T00:00:00');

    if (form.salary_min === '') return setError('Minimum salary is required.');
    if (form.salary_max === '') return setError('Maximum salary is required.');
    if (Number(form.salary_min) < 0) return setError('Min salary must be 0 or greater.');
    if (Number(form.salary_max) < Number(form.salary_min)) return setError('Max salary must be ≥ min salary.');
    if (!form.start_time) return setError('Start date is required.');
    if (!form.end_time) return setError('End date is required.');
    if (start <= now) return setError('Start date must be in the future.');
    if (end <= start) return setError('End date must be after start date.');
  
      setLoading(true);
      try {
        await api.post('/businesses/me/jobs', {
          position_type_id: positionType.id,
          salary_min: Number(form.salary_min),
          salary_max: Number(form.salary_max),
          start_time: new Date(form.start_time + 'T00:00:00').toISOString(),
          end_time: new Date(form.end_time + 'T00:00:00').toISOString(),
          ...(form.note.trim() && { note: form.note.trim() }),
        });
        setSuccess(true);
        setTimeout(onClose, 1500);
      } catch (err) {
        console.log(err.response?.data);
        setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="modalOverlay">
        <div className="modalContent">
          <h2 className="modalTitle">Post a Job — {positionType.name}</h2>
  
          <div className="filterGroup">
            <label className="filterLabel">Hourly Salary Range</label>
            <div className="filterRow">
              <div className="filterInputGroup">
                <label className="filterSubLabel">Min salary ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  min={0}
                  className="filterSelect"
                  value={form.salary_min}
                  onChange={(e) => setField('salary_min', e.target.value)}
                />
              </div>
              <div className="filterInputGroup">
                <label className="filterSubLabel">Max salary ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 40"
                  min={0}
                  className="filterSelect"
                  value={form.salary_max}
                  onChange={(e) => setField('salary_max', e.target.value)}
                />
              </div>
            </div>
          </div>
  
          <div className="filterGroup">
            <label className="filterLabel">Job Timing</label>
            <div className="filterRow">
              <div className="filterInputGroup">
                <label className="filterSubLabel">Start time</label>
                <input
                    type="date"
                    className="filterSelect"
                    value={form.start_time}
                    onChange={(e) => setField('start_time', e.target.value)}
                    />

<label className="filterSubLabel">End time</label>
                    <input
                    type="date"
                    className="filterSelect"
                    value={form.end_time}
                    onChange={(e) => setField('end_time', e.target.value)}
                    />
              </div>
            </div>
          </div>
  
          <div className="filterGroup">
            <label className="filterLabel">
              Note{' '}
              <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '12px', color: '#999' }}>
                (optional)
              </span>
            </label>
            <textarea
              className="modalTextarea"
              placeholder="Any additional details for candidates..."
              value={form.note}
              onChange={(e) => setField('note', e.target.value)}
            />
          </div>
  
          {error && <p className="modalError">{error}</p>}
          {success && <p style={{ color: '#1a7a45', fontSize: '14px', fontWeight: 600 }}>Job posted successfully!</p>}
  
          <div className="modalActions">
            <button className="modalCancelBtn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="saveBtn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </div>
      </div>
    );
  }



function PositionTypeSearchPage() {
  const [filters, setFilters] = useState({
    name: "asc",
    num_qualified: "asc",
    hidden: undefined,
  });
  const [editTarget, setEditTarget] = useState(null);   // which PT is being edited
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [myQualifications, setMyQualifications] = useState([]);
  const [showCreateJob, setShowCreateJob] = useState(false);
    const [selectedPT, setSelectedPT] = useState(null);

  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';
  const isRegUser = user?.role === 'regular';
  const onUpdate = useRef(null); 

  useEffect(() => {
  if (!isRegUser) return;
  api.get("/users/me")
    .then(res => setMyQualifications(res.data.qualifications || []))
    .catch(() => {});
}, [isRegUser]);

  const setFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleJoinPosition = async (positionTypeId) => {
  try {
    const res = await api.post("/qualifications", { 
      position_type_id: positionTypeId 
    });
    setMyQualifications(prev => [...prev, { position_id: positionTypeId }]);
  } catch (err) {
    if (err.response?.status === 409) {
      alert("You already have a request for this position.");
    }
  }
  };

  const openEditModal = (pt) => {
    setEditTarget(pt);
    setEditName(pt.name);
    setEditDesc(pt.description);
  };

  const handleCreatePosition = async ()=>{
    try {
      await api.post("/position-types", {
        name: createName,
        description: createDesc,
      });
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      // trigger a refetch by bumping filters
      setFilters(prev => ({ ...prev }));
    } catch (err){
      const message = err.response?.data?.error || "Failed to create position type.";
      setCreateError(message);
    }
  }

  const handleHidePosition = async (positionTypeId, positionType) =>{
    try {
      await api.patch(`/position-types/${positionTypeId}`,{
        hidden: !positionType.hidden,
      })
      const updated = { ...positionType, hidden: !positionType.hidden};
      onUpdate.current?.(updated); // update in place
    } catch (err) {
      console.error("Failed to hide position type", err);
    }
  }

  const handleDeletePosition = async (positionTypeId) =>{
    try {
      await api.delete(`/position-types/${positionTypeId}`)
    } catch (err) {
      const message = err.response?.data?.error || "Failed to delete position type.";
      setDeleteError(message);
    }
  }

  return (
    <div>
        {/* Post a Job modal */}
        {showCreateJob && selectedPT && (
        <CreateJobModal
            positionType={selectedPT}
            onClose={() => { setShowCreateJob(false); setSelectedPT(null); }}
        />
        )}
      

      {/* positiontype-specific filter UI */}
    <div className= {isAdmin ? "filters_buttons" : "notJobfilters"}>
        <select onChange={(e) => setFilter('name', e.target.value)} className='filterSelect'>
          <option value="">No sort</option>
          <option value="asc">Name (A→Z)</option>
          <option value="desc">Name (Z→A)</option>
        </select>

        {isAdmin && (
          <>
          <select onChange={(e) => setFilter('hidden', e.target.value === "" ? undefined : e.target.value === "true")} className='filterSelect'>
          <option value="">Any status</option>
          <option value="true">Hidden</option>
          <option value="false">Not hidden</option>
        </select>
        <div className='adminActions'>
          <button className="create-btn"  onClick={() => setShowCreate(true)}>
            Create a Position Type
          </button>
        </div>
        </>)}
      
      </div>
      <SearchPage
        onItemUpdate={onUpdate}
        apiEndpoint="/position-types"
        placeholder="Search position types..."
        paramBuilder={positionTypeParamBuilder}
        extraFilters={filters}
        renderResult={(pt) => (
          <div className="resultCard">
            <div className="position-info">
              <strong className='resultTitle'>{pt.name}</strong>
              <p className='resultSub'>{pt.description}</p>
            </div>

          </div>
        )}
        renderDetail={(pt) => (
            <div className="detailCard">
              <h2 className="detailTitle">{pt.name}</h2>
              <hr />
              <ul className='detailList'>
                <li>{pt.description}</li>
                {isAdmin && (
                  <>
                    <li>Hidden: {pt.hidden ? "True" : "False"}</li>
                    <li>Number of qualified candidates: {pt.num_qualified}</li>
                  </>
                )}
              </ul>
              <div className="userActions">
                {isRegUser && (myQualifications.some(q => q.position_id === pt.id) ? (
                  <p className="applied-msg">
                    You've already applied for this qualification.
                    Review it in your profile.
                  </p>
                ) : (
                  <button className="apply-btn" onClick={() => handleJoinPosition(pt.id)}>
                    Apply for Qualification
                  </button>
                ))}
          
                {isAdmin && (
                  <div className='adminActions'>
                    <button className="hide-btn" onClick={() => handleHidePosition(pt.id, pt)}>
                      {pt.hidden ? "Unhide Position Type" : "Hide Position Type"}
                    </button>
                    <button className="edit-btn" onClick={() => openEditModal(pt)}>
                      Edit Position Type
                    </button>
                    <button className="delete-btn" onClick={() => handleDeletePosition(pt.id)}>
                      Delete Position Type
                    </button>
                  </div>
                )}
          
                {/* Post a Job — available to business users */}
                {!isAdmin && !isRegUser && (
                  <button
                    className="editBtn"
                    onClick={() => { setSelectedPT(pt); setShowCreateJob(true); }}
                  >
                    Post a Job
                  </button>
                )}
              </div>
            </div>
          )}
      />
    </div>
  );
}

export default PositionTypeSearchPage;