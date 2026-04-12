import { useState, useEffect } from 'react';
import SearchPage from './search.jsx';
import api from '../../../services/api';
import './style.css';

const jobParamBuilder = (query, page, limit, filters) => ({
  ...(query                    && { keyword: query }),
  ...(filters.sort             && { sort: filters.sort }),
  ...(filters.order            && { order: filters.order }),
  ...(filters.position_type_id && { position_type_id: filters.position_type_id }),
  ...(filters.business_id      && { business_id: filters.business_id }),
  ...(filters.lat              && { lat: filters.lat }),
  ...(filters.lon              && { lon: filters.lon }),
  page,
  limit,
});

function JobSearchPage() {
  const [filters, setFilters] = useState({
    sort: '',
    order: 'asc',
    position_type_id: undefined,
    business_id: undefined,
    lat: undefined,
    lon: undefined,
  });

  const [positionTypes, setPositionTypes] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [interestedJobs, setInterestedJobs] = useState(new Set());
  const [interestError, setInterestError] = useState(null);

  useEffect(() => {
    api.get('/position-types').then((res) => setPositionTypes(res.data)).catch(() => {});
    api.get('/businesses').then((res) => setBusinesses(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
  api.get('/users/me')
    .then(res => {
      const ids = res.data.interests
        ?.filter(i => i.user_interest === true)
        .map(i => i.job_id) || [];
      setInterestedJobs(new Set(ids));
    })
    .catch(() => {});
}, []);

  const setFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setFilter('lat', pos.coords.latitude);
      setFilter('lon', pos.coords.longitude);
    });
  };

  // allow user to toggle interest
  const toggleInterest = async (jobId) => {
  try {
    const isInterested = interestedJobs.has(jobId);
    await api.patch(`/jobs/${jobId}/interested`, {
      interested: !isInterested,
    });
    setInterestedJobs(prev => {
      const newSet = new Set(prev);
      isInterested ? newSet.delete(jobId) : newSet.add(jobId);
      return newSet;
    });
  } catch (err) {
    if (err.response?.status === 409) {
       setInterestError("This job is no longer available.");
    } else if (err.response?.status === 403) {
      setInterestError("You don't qualify for this job.");
    } else {
      setInterestError("Failed to toggle interest.");
    }
  }
};

  return (
    <div>
        <div className="filters">
        <select
          onChange={(e) => setFilter('sort', e.target.value)}
          className="filterSelect"
        >
          <option value="">No sort</option>
          <option value="start_time">Start Time</option>
          <option value="salary_min">Min Salary</option>
          <option value="salary_max">Max Salary</option>
          <option value="distance">Distance</option>
          <option value="eta">ETA</option>
          <option value="updatedAt">Last Updated</option>
        </select>

        <select
          className="filterSelect"
          onChange={(e) => {
            const selected = positionTypes.find((pt) => pt.name === e.target.value);
            setFilter('position_type_id', selected ? selected.id : undefined);
          }}
        >
          <option value="">All position types</option>
          {/* {positionTypes.map((pt) => (
            <option key={pt.position_id} value={pt.name}>{pt.name}</option>
          ))} */}
        </select>

        <select
          className="filterSelect"
          onChange={(e) => {
            const selected = businesses.find((b) => b.business_name === e.target.value);
            setFilter('business_id', selected ? selected.id : undefined);
          }}
        >
          <option value="">All businesses</option>
          {/* {businesses.map((b) => (
            <option key={b.id} value={b.business_name}>{b.business_name}</option>
          ))} */}
        </select>

        <button className="filterSelect" onClick={useMyLocation}>
          {filters.lat ? `${filters.lat.toFixed(2)}, ${filters.lon.toFixed(2)}` : 'Use my location'}
        </button>

        {filters.lat && (
          <button
            className="filterSelect"
            onClick={() => { setFilter('lat', undefined); setFilter('lon', undefined); }}
          >
            Clear location
          </button>
        )}
      </div>

      <SearchPage
        apiEndpoint="/jobs"
        placeholder="Search jobs..."
        paramBuilder={jobParamBuilder}
        extraFilters={filters}
        renderResult={(job) => (
          <div className="resultCard">
            <strong className="resultTitle">{job.title}</strong>
            <span className="resultSub">{job.business_name}</span>
            <span className="resultSub">
              {job.salary_min && job.salary_max
                ? `$${job.salary_min} – $${job.salary_max}`
                : job.salary_min
                ? `From $${job.salary_min}`
                : ''}
            </span>
            <li><strong>Position Type:</strong> {job.position_type.name}</li>
            {job.distance != null && <span>{job.distance.toFixed(1)} km away</span>}
          </div>
          )}
        renderDetail={(job) => (
          <div className="detailCard">
            <h2 className="detailTitle">{job.title}</h2>
            <hr />
            <ul className='detailList'>
              <li><strong>Business:</strong> {job.business_name}</li>
              <li><strong>Position Type:</strong> {job.position_type.name}</li>
              {job.salary_min && job.salary_max && (
                <li><strong>Salary:</strong> ${job.salary_min} – ${job.salary_max}</li>
              )}
              {job.salary_min && !job.salary_max && (
                <li><strong>Salary:</strong> From ${job.salary_min}</li>
              )}
              {job.description && (
                <li><strong>Description:</strong> {job.description}</li>
              )}
              {job.distance != null && (
                <li><strong>Distance:</strong> {job.distance.toFixed(1)} km away</li>
              )}
            </ul>

            <div className='interestContainer'>

              <button
                onClick={() => toggleInterest(job.id)}
                className="interestButton"
              >
                {interestedJobs.has(job.id)
                  ? "Cancel Interest"
                  : "I'm Interested"}
              </button>
              {interestError && <p className="interestErrorMsg">{interestError}</p>}    
            </div>
          </div>  
        )}
      />
      </div>
  );
}

export default JobSearchPage;