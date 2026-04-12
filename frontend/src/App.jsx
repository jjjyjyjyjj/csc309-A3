import { useState } from 'react'
import './App.css'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/navbar/navBar';
// import ProtectedRoute from './components/common/ProtectedRoute';

// Public
import LandingPage from './components/public/landingPage/landingPage';
import Login from './pages/login/login';
import Register from './pages/register/register';
import PasswordReset from './pages/passwordreset/reset';
import BusinessList from './pages/businesslist/businesses';

// // Regular User
import RegularProfile from './pages/profile/profile';
import JobList from './pages/jobslist/jobs';
import CreateProfile from './pages/profile/createProfile';
import PositionList from './pages/positiontypelists/positionTypes';
import UserList from './pages/userlist/users';
import Invitations from './components/user/myInvitations';
import Interests from './components/user/myInterests';

// Business
import MyJobs from './components/business/myJobs';
import CreateJob from './components/business/CreateJob';


// // Admin
// import AdminUsers from './components/admin/Users';
// import AdminBusinesses from './components/admin/Businesses';
import QualificationList from './pages/qualificationslist/QualificationsList';
import SystemConfiguration from './pages/config/Config';

//Messages
import MessageChannel from './pages/messages/messages';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Navbar /> 
        <div className="container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset" element={<PasswordReset />} />
            <Route path="/businesses" element={<BusinessList />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/profile" element={<RegularProfile />} />
            <Route path="/createprofile" element={<CreateProfile />} />
            <Route path="/business-jobs" element={<MyJobs />} />
            <Route path="/messages" element={<MessageChannel />} />
            <Route path="/positions" element={<PositionList />}/>
            <Route path="/users" element={<UserList />} />
            <Route path="/qualifications" element={<QualificationList />} />
            <Route path="/create-job" element={<CreateJob />} />
            <Route path="/invites" element={<Invitations />} />
            <Route path="/interests" element={<Interests />} />
            <Route path="/config" element={<SystemConfiguration />} />
            {/* Regular User
            <Route
              path="/profile"
              element={
                <ProtectedRoute role="regular">
                  <RegularProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute role="regular">
                  <JobSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qualifications"
              element={
                <ProtectedRoute role="regular">
                  <Qualifications />
                </ProtectedRoute>
              }
            />

              Business
            <Route
              path="/business/profile"
              element={
                <ProtectedRoute role="business">
                  <BusinessDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business/jobs/new"
              element={
                <ProtectedRoute role="business">
                  <CreateJob />
                </ProtectedRoute>
              }
            />

            Admin 
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute role="administrator">
                  <AdminUsers />
                </ProtectedRoute>
              }
            /> */}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
