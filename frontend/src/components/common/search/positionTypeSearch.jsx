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

function PositionTypeSearchPage() {
  const [filters, setFilters] = useState({
    name: "asc",
    num_qualified: "asc",
    hidden: undefined,
  });
  const [editTarget, setEditTarget] = useState(null);   // which PT is being edited
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [deleteError, setDeleteError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createHidden, setCreateHidden] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createError, setCreateError] = useState(null);
  const [myQualifications, setMyQualifications] = useState([]);

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

  const handleEditPosition = async () =>{
    try {
      await api.patch(`/position-types/${editTarget.id}`,{
        name: editName,
        description: editDesc,
      })
      const updated = { ...editTarget, name: editName, description: editDesc };
      onUpdate.current?.(updated); // update in place
      setEditTarget(null);
    } catch (err) {
      console.error("Failed to edit position type", err);
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
      {/* Edit modal */}
      {editTarget && (
        <div className="modalOverlay">
          <div className="modalBox">
            <h2>Edit Position Type</h2>
            <label>Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="modalInput"
            />
            <label>Description</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="modalInput"
            />
            <div className="modalActions">
              <button onClick={handleEditPosition} className="edit-btn">Save</button>
              <button onClick={() => setEditTarget(null)} className="delete-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
  {/* delete modal */}
      {deleteError && (
        <div className="modalOverlay">
          <div className="modalBox">
            <h2>Oops!</h2>
            <p>This position type cannot be deleted </p>
            <div className="modalActions">
              <button onClick={() => setDeleteError(null)} className="edit-btn">OK</button>
            </div>
          </div>
        </div>
      )}
    {/* create modal */}
    {showCreate && (
  <div className="modalOverlay">
    <div className="modalBox">
      <h2>Create Position Type</h2>
      <label>Name</label>
      <input
        value={createName}
        onChange={(e) => setCreateName(e.target.value)}
        className="modalInput"
        placeholder="Position type name"
      />
      <label>Hidden</label>
      <input
        value={createHidden}
        onChange={(e) => setCreateHidden(e.target.value)}
        className="modalInput"
        placeholder="Visibility Status"
      />
      <label>Description</label>
      <textarea
        value={createDesc}
        onChange={(e) => setCreateDesc(e.target.value)}
        className="modalInput"
        placeholder="Description"
      />
      {createError && (
        <p style={{ color: 'red', fontSize: '0.85rem' }}>{createError}</p>
      )}
      <div className="modalActions">
        <button onClick={handleCreatePosition} className="edit-btn">Create</button>
        <button onClick={() => { setShowCreate(false); setCreateError(null); }} className="delete-btn">Cancel</button>
      </div>
    </div>
  </div>
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
            {isAdmin &&(
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
                <button
                  className="apply-btn"
                  onClick={() => handleJoinPosition(pt.id)}
                >
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
            </div>
          </div>
        )}
      />
    </div>
  );
}

export default PositionTypeSearchPage;