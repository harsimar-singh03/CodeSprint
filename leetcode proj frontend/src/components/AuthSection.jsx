import React from "react";

// AuthSection renders login and registration forms.
// It switches inputs depending on whether the user is logging in, logging in as admin, or registering.
export default function AuthSection({
  authMode,       // "userLogin" | "adminLogin" | "register"
  setAuthMode,    // Switches the form mode
  loading,        // Prevents double submissions during API calls
  handleLogin,    // Action trigger for user/admin logins
  handleRegister, // Action trigger for creating a new account
  setNotice,      // Clears warnings
  setSuccess      // Clears success notices
}) {
  return (
    <section className="auth-shell">
      {/* Brand marketing panel */}
      <div className="brand-panel">
        <p className="eyebrow">CodeSprint</p>
        <h1>Practice problems, run code, submit solutions.</h1>
        <p className="muted">
          Users solve questions here. Admins use their own login to publish problems, test cases, and starter code.
        </p>
      </div>

      {/* Auth Card containing forms */}
      <div className="auth-card">
        {/* Toggle buttons to switch forms */}
        <div className="segmented">
          <button
            type="button"
            className={authMode === "userLogin" ? "primary" : ""}
            onClick={() => {
              setAuthMode("userLogin");
              setNotice("");
              setSuccess("");
            }}
          >
            User
          </button>
          <button
            type="button"
            className={authMode === "adminLogin" ? "primary" : ""}
            onClick={() => {
              setAuthMode("adminLogin");
              setNotice("");
              setSuccess("");
            }}
          >
            Admin
          </button>
          <button
            type="button"
            className={authMode === "register" ? "primary" : ""}
            onClick={() => {
              setAuthMode("register");
              setNotice("");
              setSuccess("");
            }}
          >
            Register
          </button>
        </div>

        {/* User Login Form */}
        {authMode === "userLogin" && (
          <form className="panel" onSubmit={(e) => handleLogin(e, false)}>
            <h2>User Login</h2>
            <label>
              Email
              <input name="emailId" type="email" required placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input name="password" type="password" required placeholder="Your password" />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>
        )}

        {/* Admin Login Form */}
        {authMode === "adminLogin" && (
          <form className="panel" onSubmit={(e) => handleLogin(e, true)}>
            <h2>Admin Login</h2>
            <label>
              Email
              <input name="emailId" type="email" required placeholder="admin@example.com" />
            </label>
            <label>
              Password
              <input name="password" type="password" required placeholder="Your password" />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Login as Admin"}
            </button>
          </form>
        )}

        {/* Signup Register Form */}
        {authMode === "register" && (
          <form className="panel" onSubmit={handleRegister}>
            <h2>Register</h2>
            <label>
              First name
              <input name="firstName" required minLength={3} maxLength={20} placeholder="Aman" />
            </label>
            <label>
              Email
              <input name="emailId" type="email" required placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input name="password" type="password" required placeholder="Strong password" />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Create account"}
            </button>
            <p className="hint">Password must include uppercase, lowercase, number, and symbol.</p>
          </form>
        )}
      </div>
    </section>
  );
}
