import React from "react";
import { difficultyClass } from "../utils/api";

// ProblemList shows the left-side sidebar loaded with available problems.
export default function ProblemList({
  problems,       // List of all problems from API
  solved,         // List of problems solved by current user
  activeProblem,  // Current problem detail loaded in workspace
  loadProblems,   // Action to refresh list
  setView,        // Switches views
  openProblem     // Action to load problem details
}) {
  // Convert list of solved problems into a set of IDs for constant-time lookups
  const solvedIds = new Set(solved.map((item) => item._id));

  return (
    <aside className="sidebar">
      {/* Sidebar header */}
      <div className="sidebar-head">
        <div>
          <p className="eyebrow">Problems</p>
          <h2>{problems.length || 0} available</h2>
        </div>
        <button className="icon-button" onClick={loadProblems} title="Refresh problems">
          R
        </button>
      </div>

      {/* List of problem button rows */}
      <div className="problem-list">
        {problems.length > 0 ? (
          problems.map((problem) => (
            <button
              key={problem._id} // Key is required by React to efficiently track dynamic lists
              className={`problem-row ${activeProblem?._id === problem._id ? "selected" : ""}`}
              onClick={() => {
                setView("solve"); // Make sure we are in the workspace solve view
                openProblem(problem._id); // Load problem info
              }}
            >
              <span>
                <strong>{problem.title}</strong>
                <small>{problem.tags}</small>
              </span>
              
              {/* Dynamic difficulty pill style (green for easy, yellow for medium, red for hard) */}
              <span className={difficultyClass(problem.difficulty)}>{problem.difficulty}</span>
              
              {/* If user solved this problem, show check badge */}
              {solvedIds.has(problem._id) && <span className="solved">Solved</span>}
            </button>
          ))
        ) : (
          <p className="empty">No problems found.</p>
        )}
      </div>
    </aside>
  );
}
