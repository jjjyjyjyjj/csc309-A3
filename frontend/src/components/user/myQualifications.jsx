import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth, BACKEND_URL } from "../../context/AuthContext";
import api from "../../services/api";
import "./qualifications.css";

export default function Qualifications() {
  const { id } = useParams();
  const { authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDoc, setShowDoc] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateNote, setUpdateNote] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [updateFile, setUpdateFile] = useState(null);

  // fetch a specific qualification if ID is in URL
  const fetchSingleQualification = useCallback(async (qualId) => {
    setLoading(true);
    try {
      const res = await api.get(`/qualifications/${qualId}`);
      setSelectedItem(res.data);
    } catch (err) {
      setError("Could not find this qualification.");
    } finally {
      setLoading(false);
    }
  }, []);

  // fetch the full list of qualifications from the user profile
  const fetchUserQualifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/me");
      if (res.data.qualifications && res.data.qualifications.length > 0) {
        setResults(res.data.qualifications); 
        // set a default selection if one isn't already selected
      setSelectedItem(prev => prev || res.data.qualifications[0]);
      } else{
        setResults([]);
        setError("You haven't applied for any qualifications yet.");
      }
    } catch (err) {
      setError("Failed to load qualifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (id) {
        fetchSingleQualification(id);
      } else {
        fetchUserQualifications();
      }
    }
  }, [id, authLoading, fetchSingleQualification, fetchUserQualifications]);

  useEffect(() => {
    setShowDoc(false);
  }, [selectedItem]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use qualification_id from your schema
      const qualId = selectedItem.qualification_id;
      
      const payload = { status: newStatus, note: updateNote };
      await api.patch(`/qualifications/${qualId}`, payload);

      if (updateFile) {
        const formData = new FormData();
        formData.append("document", updateFile);
        await api.put(`/qualifications/${qualId}/document`, formData);
      }

      setIsModalOpen(false);
      fetchUserQualifications(); // Refresh the list
    } catch (err) {
      setError("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = () => {
    setUpdateNote(selectedItem.note || "");
    setNewStatus(selectedItem.status || "");
    setUpdateFile(null);
    setIsModalOpen(true);
  };

  if (authLoading || loading) return <div>Loading...</div>;

  return (
    <div className="qualificationsPage">
      <div className="qualListContainer">
        <ul className="resultList">
          {results.map((item) => (
            <li 
              key={item.qualification_id} 
              onClick={() => setSelectedItem(item)}
              className={selectedItem?.qualification_id === item.qualification_id ? 'qualActive' : ''}
            >
              <div className="qualSummary">
                <strong>{item.position_type?.name || "Unknown Position"}</strong> 
                <p>Status: {item.status}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedItem && (
        <div className="detailPanel">
          <h2>Qualification Details</h2>
          <div className="detailGrid">
            <p><strong>Position:</strong> {selectedItem.position_type.name}</p>
            <p><strong>Last Updated:</strong> {new Date(selectedItem.updatedAt).toLocaleDateString()}</p>
            
            <div className="noteSection">
              <p><strong>Your Note:</strong></p>
              <p>{selectedItem.note || "No note provided."}</p>
            </div>

            <div className="buttons">
              <button className="EditDocBtn" onClick={openUpdateModal}>
                Update Request
              </button>
              
              {selectedItem.document && (
                <button 
                  onClick={() => setShowDoc(!showDoc)} 
                  className="viewDocBtn"
                >
                  {showDoc ? "Hide Document" : "View Document"}
                </button>
              )}
          
          {/* {(selectedItem.status === "created" || selectedItem.status === "approved" || selectedItem.status === "rejected") && (
            <button className="updateBtn" onClick={openUpdateModal}>
              Update Status
            </button>
          )}  */}
          </div>
          {/* Conditional Rendering of qual doc*/}
              {showDoc && selectedItem.document && (
                <div className="preview">
                  <div className="previewHeader">
                    <button onClick={() => setShowDoc(false)} className="closePreview">×</button>
                    <a 
                        href={`${BACKEND_URL}/${selectedItem.document}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="openTab"
                      >
                        Open in New Tab
                      </a>
                  </div>
                  <iframe 
                    src={`${BACKEND_URL}/${selectedItem.document}`}
                    width="100%"
                    height="500px"
                    title="Document Preview"
                  />
                </div>
              )}
        </div>
        </div>
      )}
      
      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3>Update {selectedItem.position_type.name}</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="formGroup">
                <label>New Note:</label>
                <textarea 
                  value={updateNote} 
                  onChange={(e) => setUpdateNote(e.target.value)}
                  placeholder="Explain your changes..."
                />
              </div>

              <div className="formGroup">
                <label>New Status</label>
                <textarea 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  placeholder="New status..."
                />
              </div>

              <div className="formGroup">
                <label>Replace Document (Optional):</label>
                <input 
                  type="file" 
                  onChange={(e) => setUpdateFile(e.target.files[0])} 
                />
              </div>

              <div className="modalActions">
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="saveBtn" disabled={loading}>
                  {loading ? "Saving..." : "Saved Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}