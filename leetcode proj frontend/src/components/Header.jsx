import React from "react";

// Header component handles navigation at the top of the dashboard.
// Props are properties passed by the parent App component to feed data and state triggers.
export default function Header({
  user,                     // Current user object
  view,                     // Active view name ("solve" | "profile" | "admin")
  setView,                  // State trigger to change the current view
  loadProfile,              // Function to reload profile data from backend
  loadAdminSubmissions,     // Function to reload admin submissions log
  handleLogout              // Function to execute user logout
}) {
  const isAdmin = user?.role === "admin";

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">CodeSprint</p>
        <strong>
          {user?.firstName}
          {isAdmin ? " - Admin" : ""}
        </strong>
      </div>
      
      <nav className="nav-actions">
        {/* Solve tab is available for both users and admins */}
        <button
          className={view === "solve" ? "primary" : ""}
          onClick={() => setView("solve")}
          type="button"
        >
          Solve
        </button>

        {/* Regular clients see the Profile tab */}
        {!isAdmin && (
          <button
            className={view === "profile" ? "primary" : ""}
            onClick={async () => {
              setView("profile");
              await loadProfile();
            }}
            type="button"
          >
            Profile
          </button>
        )}

        {/* Admins see the Admin panel tab */}
        {isAdmin && (
          <button
            className={view === "admin" ? "primary" : ""}
            onClick={async () => {
              setView("admin");
              await loadAdminSubmissions();
            }}
            type="button"
          >
            Admin
          </button>
        )}

        {/* Logout action */}
        <button onClick={handleLogout} type="button">
          Logout
        </button>
      </nav>
    </header>
  );
}
