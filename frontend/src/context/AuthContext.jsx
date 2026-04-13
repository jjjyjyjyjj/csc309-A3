import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { io } from "socket.io-client";

const AuthContext = createContext();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const socket = io(BACKEND_URL, {
  withCredentials: true,
  autoConnect: false
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // will have full user with role
    }
    setLoading(false);
  }, []);

  // const login = async (email, password) => {
  //   try {
  //     const response = await api.post('/auth/tokens', { email, password });
  //     const { token } = response.data; // Only get token

  //     localStorage.setItem('token', token);
  //     let currUser = null;
  //     // set current user 
  //     try{
  //       // get reg user
  //       const profileRes = await api.get('/users/me');
  //       currUser = profileRes.data;
  //     } catch (err) {
  //       // try fetching as a business
  //       const businessRes = await api.get('/businesses/me');
  //       currUser = businessRes.data;
  //   }

  //   if (!currUser) throw new Error("Could not retrieve profile");

  //     localStorage.setItem('user', JSON.stringify(currUser));
  //     setUser(currUser);
  //     return { user: currUser, error: null };
  //   } catch (err) {
  //     // Check for specific 403 (Not Activated) or 401 (Invalid Credentials)
  //     const status = err.response?.status;
  //     let message = err.response?.data?.message || 'Login failed';
      
  //     if (status === 403) message = "Account is not activated yet.";
  //     if (status === 401) message = "Invalid email or password.";

  //     return { user: null, error: { message } };
  //   }
  // };

  const login = async (email, password) => {
  try {
    const response = await api.post('/auth/tokens', { email, password });
    const { token } = response.data;
    localStorage.setItem('token', token);

    // 1. Decode immediately to see the role
    const decoded = jwtDecode(token);
    const role = decoded.role; // Verify if this is 'admin' or 'administrator'

    let currUser = null;

    if (role === 'business') {
      const businessRes = await api.get('/businesses/me');
      currUser = businessRes.data;
    } 
    else if (role === 'admin' || role === 'administrator') {
      // If /users/me is for regular users only, skip it for admins
      // and build a virtual profile from the token/login data.
      currUser = {
        id: decoded.id || 'admin-id',
        email: email,
        role: role,
        first_name: "System",
        last_name: "Administrator",
        avatar:null,
      };
    } 
    else {
      // Regular users
      const profileRes = await api.get('/users/me');
      currUser = profileRes.data;
    }

    // 2. Critical: Ensure the role is explicitly on the object for your UI
    currUser.role = role;

    localStorage.setItem('user', JSON.stringify(currUser));
    setUser(currUser);
    
    // 3. Fix the Socket error
    socket.connect(); // Fix for Socket 400 error

    return { user: currUser, error: null };
  } catch (err) {
  //  Check for specific 403 (Not Activated) or 401 (Invalid Credentials)
      const status = err.response?.status;
      let message = err.response?.data?.message || 'Login failed';
      
      if (status === 403) message = "Account is not activated yet.";
      if (status === 401) message = "Invalid email or password.";

      return { user: null, error: { message } };
  }
};

  const signup = async (email, password, role, payload) => {
    try {
      const endpoint = role === 'business' ? '/businesses' : '/users';
      const response = await api.post(endpoint, payload);

      // store the reset token from registration for account activation
      const { resetToken, expiresAt } = response.data;
      localStorage.setItem('resetToken', resetToken);
      localStorage.setItem('resetTokenExpiry', expiresAt);

      return { data: response.data, error: null };
    } catch (err) {
      const status = err.response?.status;
      let message = 'Signup failed. Please try again.';
      if (status === 409) message = 'An account with this email already exists.';
      return { data: null, error: { message } };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // localStorage.removeItem('resetToken');
    // localStorage.removeItem('resetTokenExpiry');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, BACKEND_URL, socket };