import React from "react";
import { difficultyClass, sampleProblem, formatJson } from "../utils/api";

// AdminView allows administrators to create problems, delete problems, check submissions, and register new admins.
export default function AdminView({
  problems,               // List of all problems
  submissions,            // Global list of latest 100 submissions
  loading,                // Lock UI buttons during actions
  loadAdminSubmissions,   // Action to refresh the submissions list
  handleCreateProblem,    // Action trigger to create a problem
  handleDeleteProblem,    // Action trigger to delete a problem
  handleCreateAdmin       // Action trigger to register a new admin
}) {
  return (
    <section className="admin-shell">
      {/* Left Column: Create Problem form */}
      <form className="panel admin-form" onSubmit={handleCreateProblem}>
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Create Problem</h2>
        </div>
        
        <div className="form-grid">
          <label>
            Title
            <input name="title" required placeholder="Two Sum" />
          </label>
          <label>
            Tags
            <input name="tags" required placeholder="array" />
          </label>
          <label>
            Difficulty
            <select name="difficulty" required defaultValue="easy">
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </label>
        </div>
        
        <label>
          Description
          <textarea name="description" required className="text-field" placeholder="Write the problem statement" />
        </label>
        
        {/* The textareas below expect JSON arrays of test cases and starter codes */}
        <label>
          Visible Test Cases JSON
          <textarea name="visibleTestCases" required className="json-field" defaultValue={formatJson(sampleProblem.visibleTestCases)} />
        </label>
        <label>
          Hidden Test Cases JSON
          <textarea name="hiddenTestCases" required className="json-field" defaultValue={formatJson(sampleProblem.hiddenTestCases)} />
        </label>
        <label>
          Start Code JSON
          <textarea name="startCode" required className="json-field" defaultValue={formatJson(sampleProblem.startCode)} />
        </label>
        <label>
          Reference Solution JSON
          <textarea name="referenceSolution" required className="json-field" defaultValue={formatJson(sampleProblem.referenceSolution)} />
        </label>
        
        <button type="submit" className="primary" disabled={loading}>
          {loading ? "Please wait..." : "Create Problem"}
        </button>
      </form>

      {/* Right Column: Manage existing problems, logs, and sub-admins */}
      <div className="panel admin-side">
        {/* Manage List of Problems */}
        <div>
          <p className="eyebrow">Manage</p>
          <h2>Existing Problems</h2>
        </div>
        <div className="admin-list">
          {problems.length > 0 ? (
            problems.map((prob) => (
              <div key={prob._id} className="admin-row">
                <span>
                  <strong>{prob.title}</strong>
                  <small>
                    {prob.tags} - {prob.difficulty}
                  </small>
                </span>
                <button type="button" className="danger" onClick={() => handleDeleteProblem(prob._id)}>
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="empty">No problems yet.</p>
          )}
        </div>

        {/* Global Submissions tracker */}
        <div className="section-head">
          <div>
            <p className="eyebrow">Submissions</p>
            <h2>Latest 100</h2>
          </div>
          <button type="button" onClick={loadAdminSubmissions}>
            Refresh
          </button>
        </div>
        <div className="admin-list">
          {submissions.length > 0 ? (
            submissions.map((sub) => {
              const problem = sub.problemId || {};
              const subUser = sub.userId || {};
              return (
                <div key={sub._id} className="admin-row">
                  <span>
                    <strong>{problem.title || "Deleted problem"}</strong>
                    <small>
                      {subUser.emailId || "Unknown user"} - {sub.language} - {sub.status}
                    </small>
                  </span>
                  <span className={difficultyClass(problem.difficulty || "")}>
                    {sub.testCasesPassed}/{sub.testCasesTotal}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="empty">No submissions yet.</p>
          )}
        </div>

        {/* Admin creation form */}
        <form id="create-admin-form" className="mini-form" onSubmit={handleCreateAdmin}>
          <h2>Create Admin</h2>
          <label>
            First name
            <input name="firstName" required minLength={3} maxLength={20} />
          </label>
          <label>
            Email
            <input name="emailId" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" required />
          </label>
          <button type="submit" disabled={loading}>
            Create Admin
          </button>
        </form>
        <p className="hint">
          Problem creation validates reference solutions against visible and hidden test cases, so it may take a few seconds.
        </p>
      </div>
    </section>
  );
}
