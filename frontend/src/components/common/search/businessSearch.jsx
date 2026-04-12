import { useState, useRef} from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import api from '../../../services/api.jsx';
import SearchPage from './search.jsx';
import './style.css';

const businessParamBuilder = (query, page, limit, filters) => ({
  ...(query              && { keyword: query }),
  ...(filters.sort       && { sort: filters.sort }),
  ...(filters.order      && { order: filters.order }),
  ...(filters.activated  !== undefined && { activated: filters.activated }),
  ...(filters.verified   !== undefined && { verified: filters.verified }),
  page,
  limit,
});


const getColor = (name = "") => {
  const colors = ["#135865", "#0f4a54", "#1f6f78", "#2a9d8f", "#264653"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

function BusinessSearchPage() {
  const [filters, setFilters] = useState({
    sort: "",
    order: "asc",
    activated: undefined,
    verified: undefined,
  });
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';
  
  const setFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const onUpdate = useRef(null); 

  const handleToggleVerified = async (business) => {
  try {
    await api.patch(`/businesses/${business.id}/verified`, {
      verified: !business.verified
    });
    const updated = { ...business, verified: !business.verified };
    onUpdate.current?.(updated); // update in place
  } catch (err) {
    console.error("Failed to update verification", err);
  }
};

  return (
    <div>
      {/* Business-specific filter UI*/}
      <div className="notJobfilters">
        <select onChange={(e) => setFilter('sort', e.target.value)} className='filterSelect'>
          <option value="">No sort</option>
          <option value="business_name">Business Name</option>
          <option value="email">Email</option>
          {isAdmin && ( <option value="email">Owner Name</option>)}
        </select>
        {isAdmin && 
        <select onChange={(e) => setFilter('activated', e.target.value === "" ? undefined : e.target.value === "true")} className='filterSelect'>
        <option value="">Any activated status</option>
        <option value="true">Activated</option>
        <option value="false">Not activated</option>
      </select>
      }
        

      {isAdmin && (
        <select onChange={(e) => setFilter('verified', e.target.value === "" ? undefined : e.target.value === "true")} className='filterSelect'>
          <option value="">Verified</option>
          <option value="false">Not verified</option>
        </select>
      )}
      </div>

      <SearchPage
        onItemUpdate={onUpdate}
        apiEndpoint="/businesses"
        placeholder="Search businesses..."
        paramBuilder={businessParamBuilder}
        extraFilters={filters}
        renderResult={(b) => (
          <div className="resultCard">
            <strong className="resultTitle">{b.business_name}</strong>
            <span className="resultSub">{b.postal_address}</span>
          </div>
        )}
         renderDetail={(b) => (
          <div className="detailCard">
            <div className="detailAvatarWrapper">
                {b.avatar ? (
                  <img
                    src={b.avatar}
                    alt={`${b.business_name} avatar`}
                    className="detailAvatar"
                  />
                ) : (
                  <div className="detailAvatarFallback" style={{ backgroundColor: getColor(b.business_name) }}>
                    {getInitials(b.business_name)}
                  </div>
                )}
              </div>
            <h2 className="detailTitle">{b.business_name}</h2>
            <hr />
            <ul className='detailList'>
              <li>{b.bio}</li>
              <li>{b.postal_address}</li>
              <li>{b.email}</li>
              <li>{b.phone_number}</li>
              <li>{b.biography}</li>
              {isAdmin && (
                <>
                <li>owner: {b.owner_name || "N/A"}</li>
                <li>activated: {b.activated? "True" : "False"}</li>
                <li>verified: {b.verified? "True" : "False"}</li>
                <li>created at: {b.createdAt? new Date(b.createdAt).toLocaleDateString() : "N/A"}</li>

                <div className="adminActions">
                    <button 
                      className="verifyBtn" 
                      onClick={() => handleToggleVerified(b)}
                    >
                      {b.verified ? "Revoke Verification" : "Verify Business"}
                    </button>
                  </div>
                </>
              )}
            </ul>
          </div>
        )}
      />
    </div>
  );
}

export default BusinessSearchPage;