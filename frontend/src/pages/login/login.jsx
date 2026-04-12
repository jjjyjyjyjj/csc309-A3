import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext.jsx";
import { useEffect } from 'react';
import api from '../../services/api';
import './style.css';
import LoginForm from '../../components/auth/login/login.jsx';
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

export default function Login() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const role = getRole();
    const isBusiness = role === "business";

    const handleLoginSuccess = () => {
        console.log('Login successful');
        // user state will update, and useEffect will check the profile
    };

    // Check profile whenever user becomes available
    useEffect(() => {
        // Only run this if we have a user and we aren't "loading"
        if (loading || !user) return;

        const checkUserProfile = async () => {
            try {
                // Fetch the full profile now that we have a token
                let response = null;
                if (isBusiness) {
                    response = await api.get('/businesses/me'); 
                }
                else{
                    response = await api.get('/users/me'); 
                }
                const fullUser = response.data;

                // Logic: If they have a username, they are a regular user.
                // If not, maybe they are a business? 
                if (fullUser.username) {
                    navigate('/home'); // Send regular users home
                } else {
                    navigate('/businesses'); // Send others to business page
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                // If /me fails, the token might be bad
            }
        };
        checkUserProfile();
    }, [user, loading, navigate]);

    return (
        <div>
            <div className="loginContainer">
                <LoginForm onLoginSuccess={handleLoginSuccess} />
            </div>
        </div>
    );
}