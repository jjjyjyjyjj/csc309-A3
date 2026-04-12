// import { useState, useEffect } from 'react';
// import api from '../../../services/api.jsx';

// function CreateJob({ onCreated, onCancel }) {
//   const [positionTypes, setPositionTypes] = useState([]);
//   const [form, setForm] = useState({
//     position_type_id: '',
//     salary_min: '',
//     salary_max: '',
//     start_time: '',
//     end_time: '',
//     note: '',
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     api.get('position-types/').then(res => setPositionTypes(res.data)).catch(() => {});
//   }, []);

//   const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

//   const handleSubmit = async () => {
//     setError(null);

//     if (!form.position_type_id) return setError('Please select a position type.');
//     if (form.salary_min === '') return setError('Minimum salary is required.');
//     if (form.salary_max === '') return setError('Maximum salary is required.');
//     if (Number(form.salary_max) < Number(form.salary_min)) return setError('Max salary must be greater than or equal to min salary.');
//     if (!form.start_time) return setError('Start time is required.');
//     if (!form.end_time) return setError('End time is required.');
//     if (form.end_time <= form.start_time) return setError('End time must be after start time.');

//     setLoading(true);
//     try {
//       const payload = {
//         position_type_id: Number(form.position_type_id),
//         salary_min: Number(form.salary_min),
//         salary_max: Number(form.salary_max),
//         start_time: form.start_time,
//         end_time: form.end_time,
//         ...(form.note.trim() && { note: form.note.trim() }),
//       };
//       const res = await api.post('businesses/me/jobs', payload);
//       setSuccess(true);
//       setTimeout(() => {
//         setSuccess(false);
//         onCreated?.(res.data);
//       }, 1500);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="filters">

//       {/* Position Type */}
//       <div className="filterGroup">
//         <label className="filterLabel">Position Type</label>
//         <select
//           className="filterSelect"
//           value={form.position_type_id}
//           onChange={(e) => setField('position_type_id', e.target.value)}
//         >
//           <option value="">Select a position</option>
//           {positionTypes.map(pt => (
//             <option key={pt.id} value={pt.id}>{pt.name}</option>
//           ))}
//         </select>
//       </div>

//       <div className="filterHorizontalDivider" />

//       {/* Salary */}
//       <div className="filterGroup">
//         <label className="filterLabel">Hourly Salary Range</label>
//         <p className="filterHint">Set the minimum and maximum hourly rate for this posting.</p>
//         <div className="filterRow">
//           <div className="filterInputGroup">
//             <label className="filterSubLabel">Min salary ($)</label>
//             <input
//               type="number"
//               placeholder="e.g. 20"
//               min={0}
//               className="filterSelect"
//               value={form.salary_min}
//               onChange={(e) => setField('salary_min', e.target.value)}
//             />
//           </div>
//           <div className="filterInputGroup">
//             <label className="filterSubLabel">Max salary ($)</label>
//             <input
//               type="number"
//               placeholder="e.g. 40"
//               min={0}
//               className="filterSelect"
//               value={form.salary_max}
//               onChange={(e) => setField('salary_max', e.target.value)}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="filterHorizontalDivider" />

//       {/* Date Range */}
//       <div className="filterGroup">
//         <label className="filterLabel">Job Timing</label>
//         <div className="filterRow">
//           <div className="filterInputGroup">
//             <label className="filterSubLabel">Start time</label>
//             <input
//               type="datetime-local"
//               className="filterSelect"
//               value={form.start_time}
//               onChange={(e) => setField('start_time', e.target.value)}
//             />
//           </div>
//           <div className="filterInputGroup">
//             <label className="filterSubLabel">End time</label>
//             <input
//               type="datetime-local"
//               className="filterSelect"
//               value={form.end_time}
//               onChange={(e) => setField('end_time', e.target.value)}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="filterHorizontalDivider" />

//       {/* Note */}
//       <div className="filterGroup">
//         <label className="filterLabel">Note <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '12px', color: '#999' }}>(optional)</span></label>
//         <textarea
//           className="modalTextarea"
//           placeholder="Any additional details for candidates..."
//           value={form.note}
//           onChange={(e) => setField('note', e.target.value)}
//         />
//       </div>

//       {/* Error */}
//       {error && <p className="modalError">{error}</p>}

//       {/* Actions */}
//       <div className="filterGroup">
//         <div className="filterRow">
//           {onCancel && (
//             <button className="modalCancelBtn" onClick={onCancel} disabled={loading}>
//               Cancel
//             </button>
//           )}
//           <button className="searchButton" onClick={handleSubmit} disabled={loading}>
//             {loading ? 'Creating...' : 'Create Job'}
//           </button>
//         </div>
//       </div>

//       {/* Success toast */}
//       {success && (
//         <div className="successToast">Job created successfully!</div>
//       )}
//     </div>
//   );
// }

// export default CreateJob;


import PositionTypeBusinessSearchPage from "../../components/common/search/PositionTypeBusinessSearchPage";
import "./jobs.css";

export default function CreateJob() {
    return(
        <>
        <div className="searchPage">
        <h3 className='searchTitle'>Create New Postings</h3>
        <div className="searchPage">
            <PositionTypeBusinessSearchPage />
        </div>
        </div>
        </>
    )
}

