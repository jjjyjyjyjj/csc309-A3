import { useState } from "react";
import {useNavigate} from "react-router-dom";
import ProfileForm from "../../components/profile/profileForm";
import ProfilePhoto from "../../components/profile/avatarPhoto";
import api from "../../services/api";
import "./style.css";
import { jwtDecode } from "jwt-decode";

const getRole = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch {
    return null;
  }
};

export default function CreateProfilePage() {
    const [avatar, setAvatar] = useState("");
    const [profileData, setProfileData] = useState({});
    const navigate = useNavigate();
    const role = getRole();
    const isBusiness = role === "business";


    const handleSave = async () => {
        try {
            // upload avatar
            if (avatar && avatar instanceof File) {
                const formData = new FormData();
                formData.append('file', avatar);
                const config = { headers: { 'Content-Type': 'multipart/form-data' } };

                if (isBusiness) {
                    await api.put('/businesses/me/avatar', formData, config);
                } else {
                    await api.put('/users/me/avatar', formData, config);
                }
            }
            //upload resume
            if (!isBusiness && profileData.resume && profileData.resume instanceof File) {
                const resumeFormData = new FormData();
                // Assuming your resume controller also uses .single("file")
                resumeFormData.append('file', profileData.resume);
                
                const config = { headers: { 'Content-Type': 'multipart/form-data' } };
                await api.put('/users/me/resume', resumeFormData, config);
            }

            // upload text data
            if (isBusiness) {
                const { location, ...rest } = profileData;
                const businessPayload = {
                    ...rest,
                    ...(location && {
                        location_lon: parseFloat(location.lon),
                        location_lat: parseFloat(location.lat),
                    }),
                };
                await api.patch('/businesses/me', businessPayload);
            } else {
                const { resume, ...userData } = profileData;
                await api.patch('/users/me',userData); 
            }
            alert("Profile updated successfully!");
            navigate('/profile');
        } catch (err) {
            console.error("Save failed:", err);
            alert("Failed to update profile. Check console for details.");
        }
    };

    return (
        <div className="profile">
            <div className="avatarContainer">
                <ProfilePhoto handleImageChange={({ file }) => setAvatar(file)} />
            </div>
            <div className="form">
                <ProfileForm 
                    onDataChange={setProfileData} 
                    onSubmit={handleSave} 
                    submitLabel="Save Profile"
                />
            </div>
        </div>
    );
}