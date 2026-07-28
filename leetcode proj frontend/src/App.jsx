import React, { useState, useEffect } from "react";
import { api, normalizeLanguage } from "./utils/api";
import Header from "./components/Header";
import AuthSection from "./components/AuthSection";
import ProblemList from "./components/ProblemList";
import ProblemDetail from "./components/ProblemDetail";
import AiDrawer from "./components/AiDrawer";
import ProfileView from "./components/ProfileView";
import AdminView from "./components/AdminView";

export default function App() {
  
  // =========================================================================
  // 1. STATE VARIABLES
  // state hooks (useState) allow React to keep track of dynamic values. 
  // Modifying these values updates the UI instantly.
  // =========================================================================
  const [user, setUser] = useState(null); // Logged-in user object (null if logged out)
  const [authMode, setAuthMode] = useState("userLogin"); // Form switch: "userLogin" | "adminLogin" | "register"
  const [view, setView] = useState("solve"); // View switcher: "solve" | "profile" | "admin"
  
  // Data lists fetched from backend APIs
  const [problems, setProblems] = useState([]);
  const [solved, setSolved] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [profileSubmissions, setProfileSubmissions] = useState([]);
  const [profileProblemSolutions, setProfileProblemSolutions] = useState([]);
  
  // Active states inside coding workspace
  const [selectedProfileProblem, setSelectedProfileProblem] = useState(null);
  const [activeProblem, setActiveProblem] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  
  // AI Gemini chat drawer states
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Loading and alert banners
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(""); // Holds warning/error alerts
  const [success, setSuccess] = useState(""); // Holds positive status updates

  // =========================================================================
  // 2. HELPER UTILS
  // =========================================================================
  const showNotice = (msg) => {
    setNotice(msg);
    setSuccess("");
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setNotice("");
  };

  // Extracts initial starter code template matching active problem and language
  const getStarterCode = (problem, lang) => {
    const normalized = normalizeLanguage(lang);
    const starter = problem?.startCode?.find((item) => normalizeLanguage(item.language) === normalized);
    return starter?.initialCode || "";
  };

  // =========================================================================
  // 3. LIFECYCLE HOOKS (useEffect)
  // useEffect runs custom blocks of code when dependencies change.
  // Empty array [] means it runs exactly ONCE when the app first mounts (loads).
  // =========================================================================
  
  // Initial check: is the browser already logged in? (loads session token from HTTP cookies)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api("/user/check");
        setUser(data.user);
        
        // Auto navigate depending on roles
        if (data.user) {
          if (data.user.role === "admin") {
            setView("admin");
          } else {
            setView("solve");
          }
        }
      } catch (err) {
        setUser(null); // Clear session details if auth check fails
      }
    };
    checkAuth();
  }, []);

  // Whenever user session state changes, reload catalog listings
  useEffect(() => {
    if (user) {
      loadProblems();
      if (user.role === "admin") {
        loadAdminSubmissions();
      }
    }
  }, [user]);

  // =========================================================================
  // 4. ACTION DISPATCH ROUTINES
  // =========================================================================

  // Fetch problems list from backend
  const loadProblems = async () => {
    setLoading(true);
    setNotice("");
    setSuccess("");
    try {
      const problemsData = await api("/problem/getAllProblem");
      let solvedData = [];
      try {
        solvedData = await api("/problem/problemSolvedByuser");
      } catch (e) {
        // Ignore if user isn't fully authorized yet
      }
      setProblems(problemsData);
      setSolved(solvedData);
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load global submissions log (Admin only)
  const loadAdminSubmissions = async () => {
    if (user?.role !== "admin") return;
    setLoading(true);
    setNotice("");
    setSuccess("");
    try {
      const subs = await api("/submission/all");
      setSubmissions(subs);
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load personal submissions log (Client user only)
  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    setNotice("");
    setSuccess("");
    try {
      const [solvedData, profileSubs] = await Promise.all([
        api("/problem/problemSolvedByuser").catch(() => []),
        api("/submission/my").catch(() => [])
      ]);
      setSolved(solvedData);
      setProfileSubmissions(profileSubs);
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load user attempts solutions for a specific solved problem
  const loadProblemSolutions = async (problemId) => {
    const problem =
      solved.find((item) => item._id === problemId) ||
      profileSubmissions.find((item) => item.problemId?._id === problemId)?.problemId ||
      null;

    setLoading(true);
    setNotice("");
    setSuccess("");
    setSelectedProfileProblem(problem);
    setProfileProblemSolutions([]);

    try {
      const solutions = await api(`/submission/my/${problemId}`);
      setProfileProblemSolutions(solutions);
      if (solutions && solutions.length > 0) {
        setSelectedProfileProblem(solutions[0]?.problemId || problem);
      }
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full details of problem when clicked in list
  const openProblem = async (id) => {
    setLoading(true);
    setRunResult(null);
    setSubmitResult(null);
    setNotice("");
    setSuccess("");
    try {
      const problem = await api(`/problem/problemById/${id}`);
      setActiveProblem(problem);
      
      // Auto-extract first starter language defined in DB, defaults to javascript
      const starterLang = normalizeLanguage(problem.startCode?.[0]?.language || "javascript");
      setLanguage(starterLang);
      setCode(getStarterCode(problem, starterLang));
      setAiOpen(false);
      setAiMessages([]);
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Authenticate user login credentials
  const handleLogin = async (event, isAdmin = false) => {
    event.preventDefault(); // Prevent page refresh on form submit
    const formData = new FormData(event.currentTarget); // Parse inputs easily
    setLoading(true);
    setNotice("");
    setSuccess("");

    try {
      const data = await api(isAdmin ? "/user/admin/login" : "/user/login", {
        method: "POST",
        body: JSON.stringify({
          emailId: formData.get("emailId"),
          password: formData.get("password")
        })
      });
      setUser(data.user);
      setView(data.user.role === "admin" ? "admin" : "solve");
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register a new client user
  const handleRegister = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setNotice("");
    setSuccess("");

    try {
      const data = await api("/user/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          emailId: formData.get("emailId"),
          password: formData.get("password")
        })
      });
      setUser(data.user);
      setView("solve");
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clears active login session on server and frontend state
  const handleLogout = async () => {
    try {
      await api("/user/logout", { method: "POST" });
    } finally {
      setUser(null);
      setView("solve");
      setProblems([]);
      setSolved([]);
      setSubmissions([]);
      setProfileSubmissions([]);
      setProfileProblemSolutions([]);
      setSelectedProfileProblem(null);
      setActiveProblem(null);
      setRunResult(null);
      setSubmitResult(null);
      setAiOpen(false);
      setAiMessages([]);
      setAiLoading(false);
      setNotice("");
      setSuccess("");
    }
  };

  // Run code against visible test cases
  const handleRunCode = async () => {
    if (!activeProblem) return;
    setLoading(true);
    setRunResult(null);
    setSubmitResult(null);
    setNotice("");
    setSuccess("");

    try {
      const res = await api(`/submission/run/${activeProblem._id}`, {
        method: "POST",
        body: JSON.stringify({ language, code })
      });
      setRunResult(res);
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit code for final compilation tests check
  const handleSubmitCode = async () => {
    if (!activeProblem) return;
    setLoading(true);
    setSubmitResult(null);
    setNotice("");
    setSuccess("");

    try {
      const res = await api(`/submission/submit/${activeProblem._id}`, {
        method: "POST",
        body: JSON.stringify({ language, code })
      });
      setSubmitResult(res);
      loadProblems(); // Reload problems list to show correct solved status
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sends chat query along with complete active context to Gemini API
  const handleSendAiMessage = async (event) => {
    event.preventDefault();
    if (!activeProblem || aiLoading) return;

    const formData = new FormData(event.currentTarget);
    const content = String(formData.get("message") || "").trim();
    if (!content) return;

    const nextMessages = [...aiMessages, { role: "user", content }];
    event.currentTarget.reset(); // Empty text field
    setAiMessages(nextMessages);
    setAiLoading(true);
    setNotice("");
    setSuccess("");

    try {
      const data = await api("/ai/help", {
        method: "POST",
        body: JSON.stringify({
          problemId: activeProblem._id,
          language,
          code,
          runResult,
          submitResult,
          messages: nextMessages
        })
      });

      setAiMessages([...nextMessages, { role: "assistant", content: data.message }]);
    } catch (err) {
      setAiMessages([...nextMessages, { role: "assistant", content: `AI help failed: ${err.message}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Utility to parse text input value to JSON object safely
  const parseJsonField = (formData, name) => {
    try {
      return JSON.parse(formData.get(name));
    } catch {
      throw new Error(`${name} must be valid JSON.`);
    }
  };

  // Create a problem (Admin only)
  const handleCreateProblem = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setNotice("");
    setSuccess("");

    try {
      const payload = {
        title: formData.get("title").trim(),
        description: formData.get("description").trim(),
        difficulty: formData.get("difficulty"),
        tags: formData.get("tags").trim(),
        visibleTestCases: parseJsonField(formData, "visibleTestCases"),
        hiddenTestCases: parseJsonField(formData, "hiddenTestCases"),
        startCode: parseJsonField(formData, "startCode"),
        referenceSolution: parseJsonField(formData, "referenceSolution")
      };

      const result = await api("/problem/create", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      event.currentTarget.reset();
      showSuccess(result.message || "Problem created successfully.");
      await loadProblems();
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete a problem (Admin only)
  const handleDeleteProblem = async (id) => {
    if (!id) return;
    setLoading(true);
    setNotice("");
    setSuccess("");

    try {
      await api(`/problem/delete/${id}`, { method: "DELETE" });
      if (activeProblem?._id === id) {
        setActiveProblem(null);
      }
      showSuccess("Problem deleted successfully.");
      await loadProblems();
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new sub-admin user (Admin only)
  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setNotice("");
    setSuccess("");

    try {
      await api("/user/admin/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          emailId: formData.get("emailId"),
          password: formData.get("password")
        })
      });
      event.currentTarget.reset();
      showSuccess("Admin user created successfully.");
    } catch (err) {
      showNotice(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // 5. APP RENDERING LAYOUT
  // =========================================================================
  return (
    <>
      {/* Dynamic alert banners for feedback */}
      {notice && <div className="notice">{notice}</div>}
      {success && <div className="notice success">{success}</div>}

      {/* Render Main App if logged in, otherwise show authentication portal */}
      {user ? (
        <>
          <Header
            user={user}
            view={view}
            setView={setView}
            loadProfile={loadProfile}
            loadAdminSubmissions={loadAdminSubmissions}
            handleLogout={handleLogout}
          />

          {view === "admin" && user.role === "admin" ? (
            <AdminView
              problems={problems}
              submissions={submissions}
              loading={loading}
              loadAdminSubmissions={loadAdminSubmissions}
              handleCreateProblem={handleCreateProblem}
              handleDeleteProblem={handleDeleteProblem}
              handleCreateAdmin={handleCreateAdmin}
            />
          ) : view === "profile" ? (
            <ProfileView
              user={user}
              solved={solved}
              profileSubmissions={profileSubmissions}
              profileProblemSolutions={profileProblemSolutions}
              selectedProfileProblem={selectedProfileProblem}
              loadProblemSolutions={loadProblemSolutions}
            />
          ) : (
            <div className="app-layout">
              <ProblemList
                problems={problems}
                solved={solved}
                activeProblem={activeProblem}
                loadProblems={loadProblems}
                setView={setView}
                openProblem={openProblem}
              />
              <ProblemDetail
                activeProblem={activeProblem}
                language={language}
                setLanguage={setLanguage}
                code={code}
                setCode={setCode}
                runResult={runResult}
                setRunResult={setRunResult}
                submitResult={submitResult}
                setSubmitResult={setSubmitResult}
                handleRunCode={handleRunCode}
                handleSubmitCode={handleSubmitCode}
                setAiOpen={setAiOpen}
                getStarterCode={getStarterCode}
              />
            </div>
          )}
        </>
      ) : (
        <AuthSection
          authMode={authMode}
          setAuthMode={setAuthMode}
          loading={loading}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
          setNotice={setNotice}
          setSuccess={setSuccess}
        />
      )}

      {/* AI Drawer overlay chat drawer */}
      <AiDrawer
        user={user}
        view={view}
        activeProblem={activeProblem}
        aiOpen={aiOpen}
        setAiOpen={setAiOpen}
        language={language}
        runResult={runResult}
        submitResult={submitResult}
        aiMessages={aiMessages}
        aiLoading={aiLoading}
        handleSendAiMessage={handleSendAiMessage}
      />

      {/* Global screen loading overlay blocking UI clicks */}
      {loading && <div className="loading">Working...</div>}
    </>
  );
}
