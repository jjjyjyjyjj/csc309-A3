import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth, BACKEND_URL } from '../../../context/AuthContext';
import icon from '../../../assets/job-icon.svg'
import './Navbar.css';
import api from "../../../services/api";
// The routes each role can see.

const NAV_LINKS = {
  // Visitors who are not logged in
  guest: [
    { label: "Home",       to: "/" },
    { label: "Businesses", to: "/businesses" },
  ],

  // // Regular job-seeking users
  regular: [
    // { label: "Home",        to: "/" },
    { label: "Businesses",  to: "/businesses" },
    { label: "Jobs",        to: "/jobs" },
    { label: "Positions",  to: "/positions" },
    { label: "Interests",  to: "/interests" },
    { label: "Invites",  to: "/invites" },
  ],

  // Business accounts
  business: [
    // { label: "Home",        to: "/" },
    { label: "My Jobs",     to: "/business-jobs" },
    { label: "New Job Posting",     to: "/create-job" },
  ],

  // Admins
  administrator: [
    // { label: "Home",        to: "/" },
    { label: "Users",       to: "/users" },
    { label: "Businesses",  to: "/businesses" },
    { label: "Positions",   to: "/positions" },
    { label: "Qualifications", to: "/qualifications" },
    { label: "System Configuration", to: "/config" },
  ],
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}


export default function Navbar({ onLogout }) {
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const navigate = useNavigate();
  
  const role = user?.role ?? "guest"; // "?." is optional chaining — safe if user is null
  const links = NAV_LINKS[role] ?? NAV_LINKS.guest;

  // Called when the user clicks Logout
  function handleLogout() {
    logout();    // clear auth state in the parent
    navigate("/");               // send them back to the homepage
  }

   useEffect(() => {
    if (!user) return;
    const endpoint = role === "business" ? "/businesses/me" : "/users/me";
    api.get(endpoint)
    .then(res => {
        console.log("avatar from API:", res.data.avatar); 
        const avatar = res.data.avatar;
        if (avatar) setAvatarUrl(`${BACKEND_URL}/${avatar}`);
      })
      .catch(() => {}); // fail silently — initials will show as fallback
  }, [user, role]);

  return (
    <>
      <nav className="nav-root">
        <div className="nav-inner">

          {/* ---- Logo ---- */}
          <Link to="/" className="nav-logo">
            <img src={icon} alt="" className="icon" />
          </Link>

          {/* ---- Desktop: main nav links ---- */}
          {/* NavLink is like Link but automatically adds class="active" when the URL matches */}
          <ul className="nav-links">
            {links.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  // "end" means only match exactly "/" — without it, "/" would
                  // be "active" on every page since every path starts with /
                  end={to === "/"}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ---- Desktop: login / user actions ---- */}
          <div className="nav-actions">
            {user ? (
              // ---- Logged in ----
              <>
                {/* Role badge for admin and business accounts */}
                {role === "admin" && (
                  <span className="nav-role-badge badge-admin">Admin</span>
                )}
                {role === "business" && (
                  <span className="nav-role-badge badge-business">Business</span>
                )}
                {role === "regular" && (
                  <span className="nav-role-badge badge-user">Regular User</span>
                )}

                {/* Avatar circle with initials */}
                 <button className="navAvatar" onClick={() => navigate("/profile")}>
                  {avatarUrl ? (
                    <img
                      className="avatarImg"
                      src={avatarUrl}
                      alt="User Profile"
                      onError={() => setAvatarUrl(null)}  // fall back to initials on error
                    />
                  ) : (
                    <div className="avatar-initials">
                      {getInitials(`${user?.first_name ?? user?.business_name ?? ''}`)}
                    </div>)}
                </button>
                  
                {/* Logout */}
                <button className="btn-ghost" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              // ---- Logged out ----
              <>
                <Link to="/login" className="btn-ghost">
                  Login
                </Link>
                {/* <Link to="/register" className="btn-primary">
                  Sign up
                </Link> */}
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
