import { useState, useRef } from 'react';
import api from '../../../services/api';
import SearchPage from './search';
import './style.css';

const userParamBuilder = (query, page, limit, filters) => ({
  ...(query              && { keyword: query }),
  ...(filters.activated  !== undefined && { activated: filters.activated }),
  ...(filters.suspended   !== undefined && { suspended: filters.suspended }),
  page,
  limit,
});

function UserSearchPage() {
  const [filters, setFilters] = useState({
    sort: "",
    order: "asc",
    activated: undefined,
    suspended: undefined,
  });

  const setFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const onUpdate = useRef(null); 
  const handleToggleSuspension= async (userToUpdate) => {
  try {
    await api.patch(`/users/${userToUpdate.id}/suspended`, {
      suspended: !userToUpdate.suspended
    });
    const updated = { ...userToUpdate, suspended: !userToUpdate.suspended };
    onUpdate.current?.(updated); 
  } catch (err) {
    console.error("Failed to update suspended status", err);
  }
};

  return (
    <div>
      {/* user-specific filter UI*/}
      <div className="notJobfilters">
        <select onChange={(e) => setFilter('suspended', e.target.value === "" ? undefined : e.target.value === "true")} className='filterSelect'>
          <option value="">Any suspended status</option>
          <option value="true">Suspended</option>
          <option value="false">Not suspended</option>
        </select>
        <select onChange={(e) => setFilter('activated', e.target.value === "" ? undefined : e.target.value === "true")} className='filterSelect'>
          <option value="">Any activated status</option>
          <option value="true">Activated</option>
          <option value="false">Not activated</option>
        </select>
      </div>

      <SearchPage
        onItemUpdate={onUpdate}
        apiEndpoint="/users"
        placeholder="Search users..."
        paramBuilder={userParamBuilder}
        extraFilters={filters}
        renderResult={(u) => (
          <div className="resultCard">
            <strong className="resultTitle">{u.first_name}, {u.last_name}</strong>
            <span className="resultSub">{u.email}</span>
            <span className="resultSub">{u.phone_number}</span>
          </div>
        )}
        renderDetail={(u) => (
          <div className="detailCard">
            <img src={u.avatar} alt={`${u.first_name} avatar`} className="detailAvatar" />
            <h2 className="detailTitle">{u.first_name} {u.last_name}</h2>
            <hr />
            <ul className='detailList'>
              <li>Activated: {u.activated ? "True" : "False"}</li>
              <li>Suspended: {u.suspended ? "True" : "False"}</li>
              <li>{u.email}</li>
              <li>{u.postal_address}</li>
              <li>{u.biography}</li>
              </ul>
            <div className="adminActions">
              <button 
                className="suspendBtn" 
                onClick={() => handleToggleSuspension(u)}
              >
                {u.suspended ? "Revoke Suspension" : "Suspend User"}
              </button>
            </div>  
          </div>)}
      />
    </div>
  );
}

export default UserSearchPage;