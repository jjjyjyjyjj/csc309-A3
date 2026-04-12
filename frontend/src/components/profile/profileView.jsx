import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, BACKEND_URL } from '../../context/AuthContext';
import { jwtDecode } from "jwt-decode";
import Jobs from "../business/MyJobPages/JobListView";
import Qualifications from "../user/myQualifications";
import Invitations from "../user/myInvitations";
import Interests from "../user/myInterests";
import api from "../../services/api";
import './profileView.css';

const getRole = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return jwtDecode(token).role || null;
  } catch {
    return null;
  }
};

const getInitials = () => {
  if (isBusiness) {
    return profile?.business_name?.charAt(0)?.toUpperCase() || "B";
  }
  return (
    (profile?.first_name?.charAt(0) || "") +
    (profile?.last_name?.charAt(0) || "")
  ).toUpperCase() || "U";
};

export default function Profile() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [showDoc, setShowDoc] = useState(false);
  const navigate = useNavigate();
  const role = getRole();
  const isBusiness = role === "business";

  useEffect(() => {
    if (!loading && !user) {
    navigate("/login");
    }

    const endpoint = isBusiness ? "/businesses/me" : "/users/me";

    api.get(endpoint)
      .then((response) => setProfile(response.data))
      .catch((error) => console.error("Error fetching profile:", error));
  }, [user, loading, navigate, isBusiness]);

  if (!profile) {
    return <div>Loading...</div>;
  }
  return (
    <>
    <div className="profileContainer">
    <div className="user">
        <div className="avatarWrapper"> 
            <img
                src={profile.avatar ? `${BACKEND_URL}/${profile.avatar}` : ''}
                alt="Profile avatar"
                className="avatar"
                onError={e => { e.currentTarget.src = ''; }}
            />
        </div>
        <div className="userDetails">
          {isBusiness ? (
            <>
              <div className="tag">
                <h1>{profile.business_name}</h1>
                <p className={profile.verified ? "avail" : "noAvail"}>
                  {profile.verified ? "Verified" : "Unverified"}
                </p>
              </div>
              <p className="field">Email: {profile.email}</p>
              {profile.phone_number && <p className="field">Phone: {profile.phone_number}</p>}
              {profile.postal_address && <p className="field">Address: {profile.postal_address}</p>}
              {profile.biography && <p className="field">{profile.biography}</p>}
            </>
          ) : (
            <>
              <div className="tag">
                <h1>{profile.first_name} {profile.last_name}</h1>
                <p className={profile.available ? "avail" : "noAvail"}>
                  {profile.available ? "Available" : "Not Available"}
                </p>
              </div>
              <p className="field">Email: {profile.email}</p>
              {profile.phone && <p className="field">Phone: {profile.phone}</p>}
              {profile.bio && <p className="field">{profile.bio}</p>}
            </>
          )}
        </div>
        <div className="edit">
          <button className="edit" onClick={() => navigate("/createprofile")}>Edit Profile</button>
        </div>
    </div>
      {isBusiness ? (<>
      {/* <div className="businessJobs">
      <div className="jobs"> 
        <h1>Jobs:</h1>
        <Jobs />
        </div>
        </div> */}
      </>
      ):(
      <div className="userDocs">
        <div className="resume"> 
          <h1>Resume:</h1>
            {profile.resume && (
                <button 
                  onClick={() => setShowDoc(!showDoc)} 
                  className="viewResumeBtn"
                >
                  {showDoc ? "Hide Document" : "View Document"}
                </button>
              )}

            {showDoc && profile.resume && (
                  <div className="preview">
                    <div className="previewHeader">
                      <button onClick={() => setShowDoc(false)} className="closePreview">×</button>
                      <a 
                          href={`${BACKEND_URL}/${profile.resume}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="openTab"
                        >
                          Open in New Tab
                        </a>
                    </div>
                    <iframe 
                      src={`${BACKEND_URL}/${profile.resume}`}
                      width="100%"
                      height="500px"
                      title="Document Preview"
                      style={{ border: 'none' }}
                    />
                  </div>
                )}
            {showDoc && !profile.resume && (<p>No resume uploaded.</p>)}  
                 
        </div>
          <div className="qualifications"> 
              <h1>Qualifications:</h1>
              <Qualifications />
          </div>
        </div>
        )}
    </div>
    </>
  );
}