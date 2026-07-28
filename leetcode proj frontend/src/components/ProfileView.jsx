import React from "react";
import { difficultyClass } from "../utils/api";

// ProfileView renders user statistics, solved questions, and submission histories.
export default function ProfileView({
  user,                     // Logged in user info
  solved,                   // Array of problem objects solved by user
  profileSubmissions,       // Array of code submissions made by user
  profileProblemSolutions,   // Array of solutions for the selected problem
  selectedProfileProblem,   // Selected problem in profile view
  loadProblemSolutions      // Action trigger to load solutions for a problem
}) {
  
  // 1. Calculate stats counts
  const acceptedSubmissions = profileSubmissions.filter((sub) => sub.status === "accepted");
  
  // Use a simple array mapping to collect problem details.
  // To avoid duplicates, we look up unique solved problems by combining 'solved' list and accepted submissions.
  const solvedProblemsMap = {};
  
  solved.forEach((prob) => {
    if (prob && prob._id) solvedProblemsMap[prob._id] = prob;
  });
  
  acceptedSubmissions.forEach((sub) => {
    const prob = sub.problemId;
    if (prob && prob._id) solvedProblemsMap[prob._id] = prob;
  });
  
  const solvedProblems = Object.values(solvedProblemsMap);

  // Formatting date strings to readable local time formats
  const formatDate = (value) => {
    if (!value) return "No date";
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  };

  return (
    <section className="profile-shell">
      {/* Hero card showing statistics */}
      <div className="profile-hero">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>{user?.firstName}</h1>
          <p className="muted">{user?.emailId}</p>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <strong>{solvedProblems.length}</strong>
            <span>Solved</span>
          </div>
          <div className="stat-box">
            <strong>{profileSubmissions.length}</strong>
            <span>Submissions</span>
          </div>
          <div className="stat-box">
            <strong>{acceptedSubmissions.length}</strong>
            <span>Accepted</span>
          </div>
        </div>
      </div>

      {/* Grid of lists: solved list (left) & recent submissions history list (right) */}
      <div className="profile-grid">
        {/* Solved Problems selector list */}
        <section className="panel">
          <div>
            <p className="eyebrow">Solved Questions</p>
            <h2>All completed problems</h2>
          </div>
          <div className="admin-list">
            {solvedProblems.length > 0 ? (
              solvedProblems.map((problem) => (
                <button
                  key={problem._id}
                  className={`profile-problem ${selectedProfileProblem?._id === problem._id ? "selected" : ""}`}
                  type="button"
                  onClick={() => loadProblemSolutions(problem._id)} // Fetches user solutions for this problem
                >
                  <span>
                    <strong>{problem.title}</strong>
                    <small>{problem.tags}</small>
                  </span>
                  <span className={difficultyClass(problem.difficulty)}>{problem.difficulty}</span>
                </button>
              ))
            ) : (
              <p className="empty">No solved questions yet.</p>
            )}
          </div>
        </section>

        {/* Recent Submissions History log */}
        <section className="panel">
          <div>
            <p className="eyebrow">History</p>
            <h2>Recent submissions</h2>
          </div>
          <div className="admin-list">
            {profileSubmissions.length > 0 ? (
              profileSubmissions.map((submission) => {
                const problem = submission.problemId || {};
                return (
                  <div key={submission._id} className={`submission-card ${submission.status}`}>
                    <span>
                      <strong>{problem.title || "Deleted problem"}</strong>
                      <small>
                        {submission.language} - {formatDate(submission.createdAt)}
                      </small>
                    </span>
                    <span className={`status-badge ${submission.status}`}>{submission.status}</span>
                    <small>
                      {submission.testCasesPassed}/{submission.testCasesTotal} tests - {submission.runtime || 0}ms
                    </small>
                  </div>
                );
              })
            ) : (
              <p className="empty">No submissions yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Solution Panel showing full submitted code code blocks */}
      <section className="panel solution-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Solutions</p>
            <h2>{selectedProfileProblem ? selectedProfileProblem.title : "Select a solved problem"}</h2>
          </div>
          {selectedProfileProblem && (
            <span className={difficultyClass(selectedProfileProblem.difficulty)}>
              {selectedProfileProblem.difficulty}
            </span>
          )}
        </div>
        
        <div className="solution-list">
          {selectedProfileProblem ? (
            profileProblemSolutions.length > 0 ? (
              profileProblemSolutions.map((submission, index) => (
                <article key={submission._id} className="solution-card">
                  <div className="solution-head">
                    <span>
                      <strong>Submission {index + 1}</strong>
                      <small>
                        {submission.language} - {formatDate(submission.createdAt)}
                      </small>
                    </span>
                    <span className={`status-badge ${submission.status}`}>{submission.status}</span>
                  </div>
                  <div className="solution-meta">
                    <span>{submission.testCasesPassed}/{submission.testCasesTotal} tests</span>
                    <span>{submission.runtime || 0}ms</span>
                  </div>
                  
                  {submission.errorMessage && (
                    <pre className="error-output">{submission.errorMessage}</pre>
                  )}
                  <pre className="code-output">{submission.code}</pre>
                </article>
              ))
            ) : (
              <p className="empty">No submissions found for this problem.</p>
            )
          ) : (
            <p className="empty">Click any solved question above to view every solution you submitted for it.</p>
          )}
        </div>
      </section>
    </section>
  );
}
