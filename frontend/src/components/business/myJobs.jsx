// import { useState, useEffect, useCallback } from "react";
// import { useAuth } from "../../context/AuthContext";
// import api from "../../services/api";
// import "./jobs.css";

// export default function Jobs() {
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [selectedItem, setSelectedItem] = useState(null);
//     const [results, setResults] = useState([]);
//     const { user, authLoading } = useAuth();
//     const [currentPage, setCurrentPage] = useState(1);
//     const jobsPerPage = 5;

//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [updateNote, setUpdateNote] = useState("");
//     const [updateMinSal, setUpdateMinSal]= useState("");
//     const [updateMaxSal,setUpdateMaxSal]= useState("");
//     const [updateStartTime,setupdateStartTime]= useState("");
//     const [updateEndTime,setUpdateEndTime]= useState("");

//     // Calculate indexes
//     const indexOfLastJob = currentPage * jobsPerPage;
//     const indexOfFirstJob = indexOfLastJob - jobsPerPage;
//     const currentJobs = results.slice(indexOfFirstJob, indexOfLastJob);

//     // Total number of pages
//     const totalPages = Math.ceil(results.length / jobsPerPage);
    
//     const fetchJobs = useCallback(async () => {
//         if (!user) return;
//         setLoading(true);
//         try {
//         const res = await api.get("/businesses/me/jobs"); 
//         const fetchedJobs = res.data.results; 
//         setResults(fetchedJobs);
//         if (fetchedJobs.length > 0) setSelectedItem(fetchedJobs[0]);
//         } catch (err) {
//         setError("Failed to load jobs.");
//         } finally {
//         setLoading(false);
//         }
//     }, [user]);

//     const handleJobDelete = async(e) =>{
//         const confirmed = window.confirm(
//         "Are you sure you want to delete this job? This will remove all associated interests and negotiations."
//         );

//         if (confirmed) {
//             setLoading(true);
//             try {
//                 await api.delete(`/businesses/me/jobs/${selectedItem.job_id}`);
                
//                 // clear selection and refresh list
//                 setSelectedItem(null); 
//                 await fetchJobs();
//                 alert("Job deleted successfully.");
//             } catch (err) {
//                 console.error("Delete failed:", err);
//                 setError("Could not delete the job. It might have active negotiations.");
//             } finally {
//                 setLoading(false);
//             }
//         }
//     }

//     const handleUpdateSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//         const payload = {
//             salary_min:Number(updateMinSal),
//             salary_max:Number(updateMaxSal),
//             start_time:new Date(updateStartTime).toISOString(),
//             end_time:new Date(updateEndTime).toISOString(),
//             note: updateNote
//         };
//         await api.patch(`/businesses/me/jobs/${selectedItem.id}`, payload);

//         setIsModalOpen(false);
//         fetchJobs();
//         } catch (err) {
//         setError("Update failed. Please try again.");
//         } finally {
//         setLoading(false);
//         }
//     }

//     const openUpdateModal = () => {
//         setUpdateNote(selectedItem.note || "");
//         setUpdateMinSal(selectedItem.salary_min || "");
//         setUpdateMaxSal(selectedItem.salary_max || "");
//         setupdateStartTime( selectedItem.start_time || "");
//         setUpdateEndTime( selectedItem.end_time || "");
//         setIsModalOpen(true);
//     };

//     useEffect(() => {
//         if (!authLoading) fetchJobs();
//      }, [authLoading, fetchJobs]);

//   if (authLoading || loading) return <div>Loading...</div>;

// return (
//     <div className="jobPage">
//       <div className="jobListContainer">
//         <div className="paginationControls">
//             <button 
//             disabled={currentPage === 1} 
//             onClick={() => setCurrentPage(prev => prev - 1)}
//             >
//             {'<'}
//             </button>
//             <span>Page {currentPage} of {totalPages}</span>
//             <button 
//             disabled={currentPage === totalPages} 
//             onClick={() => setCurrentPage(prev => prev + 1)}
//             >
//             {'>'}
//             </button>
//         </div>
//         <ul className="resultList">
//             {currentJobs.map((item) => (
//             <li 
//                 key={item.id} 
//                 onClick={() => setSelectedItem(item)}
//                 className={selectedItem?.id === item.id ? 'JobActive' : 'JobnotActive'}
//             >
//                 <div className="jobSummary">
//                 <strong className="jobTitle">{item.positionType?.name}</strong>
//                 <p className="jobStatus">{item.status}</p>
//                 </div>
//             </li>
//             ))}
//         </ul>
        
//       </div>

//       {selectedItem && (
//         <div className="detailPanel">
//           <h2>Job Details</h2>
//             <div className="detailGrid">
//                 <p><strong>Position:</strong> {selectedItem.positionType?.name}</p>
//                 <p><strong>Worker:</strong> {selectedItem.worker ? `${selectedItem.worker.first_name} ${selectedItem.worker.last_name}` : "Unassigned"}</p>
//                 <p><strong>Minimum Salary:</strong> {selectedItem.salary_min}</p>
//                 <p><strong>Maximum Salary:</strong> {selectedItem.salary_max}</p>
//                 <p><strong>Start Time:</strong> {selectedItem.start_time}</p>
//                 <p><strong>End Time:</strong> {selectedItem.end_time}</p>
//                 <p><strong>Last Updated:</strong> {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
//                 <div className="noteSection">
//                 <p><strong>Your Note:</strong></p>
//                 <p>{selectedItem.note || "No note provided."}</p>
//                 </div>
//                 <div className="buttons">
//                     <button className="EditJobBtn" onClick={openUpdateModal}>Edit Job Details</button>
//                     {(selectedItem.status === "open" || selectedItem.status === "expired") && (
//                         <button className="deleteBtn" onClick={handleJobDelete}>
//                             Delete Job
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </div>
//         )}
//       {isModalOpen && (
//         <div className="modalOverlay">
//           <div className="modalContent">
//             <h3>Update {selectedItem.position_type.name}</h3>
//             <form onSubmit={handleUpdateSubmit}>
//               <div className="formGroup">
//                 <label>New Note:</label>
//                 <textarea 
//                   value={updateNote} 
//                   onChange={(e) => setUpdateNote(e.target.value)}
//                   placeholder="Explain your changes..."
//                 />
//               </div>

//                 <div className="formGroup">
//                     <label>New Minimum Salary:</label>
//                     <input 
//                         type="number" 
//                         value={updateMinSal}
//                         onChange={(e) => setUpdateMinSal(e.target.value)} 
//                     />
//                 </div>

//                 <div className="formGroup">
//                     <label>New Maximum Salary:</label>
//                     <input 
//                         type="number" 
//                         value={updateMaxSal}
//                         onChange={(e) => setUpdateMaxSal(e.target.value)} 
//                     />
//                 </div>
//                 <div className="formGroup">
//                     <label>New Start Time:</label>
//                     <input 
//                     type="datetime-local" 
//                     value={updateStartTime}
//                     onChange={(e) => setUpdateStartTime(e.target.value)} 
//                     />
//                 </div>

//                 <div className="formGroup">
//                     <label>New End Time:</label>
//                     <input 
//                     type="datetime-local" 
//                     value={updateEndTime}
//                     onChange={(e) => setUpdateEndTime(e.target.value)} 
//                     />
//                 </div>
//               <div className="modalActions">
//                 <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
//                 <button type="submit" className="saveBtn" disabled={loading}>
//                   {loading ? "Saving..." : "Saved Changes"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import BusinessJobs from "./MyJobPages/businessJobs"
import "./jobs.css";

export default function MyJobs() {
    return(
        <>
        {/* <div className="searchPage">
        <h3 className='searchTitle'>Find Candidates</h3> */}
        <div className="searchPage">
            <BusinessJobs />
        </div>
        {/* </div> */}
        </>
    )
}
