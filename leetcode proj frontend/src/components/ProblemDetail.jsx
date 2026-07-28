import React from "react";
import ResultsDisplay from "./ResultsDisplay";
import { difficultyClass, normalizeLanguage } from "../utils/api";

// ProblemDetail displays the active problem details, example cases, code editor, and run/submit buttons.
export default function ProblemDetail({
  activeProblem,     // Current selected problem details from parent state
  language,          // Selected editor language ("javascript" | "cpp")
  setLanguage,       // Trigger to change language
  code,              // Code content currently in the editor
  setCode,           // Trigger to edit code content state
  runResult,         // Run output object
  setRunResult,      // Trigger to clear or update run outputs
  submitResult,      // Submit output object
  setSubmitResult,   // Trigger to clear or update submit outputs
  handleRunCode,     // Action to run code against visible tests
  handleSubmitCode,  // Action to submit code against all tests
  setAiOpen,         // Opens the AI helper drawer
  getStarterCode     // Helper to fetch code templates
}) {
  
  // If no problem is selected, show initial placeholder instructions
  if (!activeProblem) {
    return (
      <section className="workspace empty-state">
        <h2>Select a problem</h2>
        <p className="muted">Choose a problem to read it, edit starter code, run visible tests, and submit.</p>
      </section>
    );
  }

  // Deduplicate starter languages defined inside the problem record
  const languages = activeProblem.startCode?.length
    ? [...new Set(activeProblem.startCode.map((item) => normalizeLanguage(item.language)))]
    : ["javascript", "cpp", "java"];

  return (
    <section className="workspace">
      {/* Workspace top header */}
      <div className="problem-header">
        <div>
          <p className="eyebrow">{activeProblem.tags}</p>
          <h1>{activeProblem.title}</h1>
        </div>
        <div className="problem-tools">
          <button type="button" className="ai-toggle" onClick={() => setAiOpen(true)} title="Open AI help">
            AI
          </button>
          <span className={difficultyClass(activeProblem.difficulty)}>{activeProblem.difficulty}</span>
        </div>
      </div>

      {/* Main split dashboard: left description statement, right code editor */}
      <div className="split">
        {/* Left Side: Statement Descriptions */}
        <article className="statement">
          <h2>Description</h2>
          <p>
            {/* Split description text by newlines and print with breaks for simple readable paragraphs */}
            {activeProblem.description?.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>

          <h2>Examples</h2>
          <div className="cases">
            {(activeProblem.visibleTestCases || []).map((testCase, index) => (
              <div key={index} className="case-card">
                <strong>Case {index + 1}</strong>
                <pre>
                  Input: {testCase.input}
                  {"\n"}Output: {testCase.output}
                  {testCase.explanation ? `\nExplanation: ${testCase.explanation}` : ""}
                </pre>
              </div>
            ))}
          </div>
        </article>

        {/* Right Side: Programming Editor & outputs */}
        <article className="editor-panel">
          <div className="toolbar">
            {/* Language Selector */}
            <label>
              Language
              <select
                value={language}
                onChange={(e) => {
                  const newLang = normalizeLanguage(e.target.value);
                  setLanguage(newLang);
                  
                  // Reload starter code template when switching languages, 
                  // or preserve current text if starter is empty
                  setCode(getStarterCode(activeProblem, newLang) || code);
                  setRunResult(null);
                  setSubmitResult(null);
                }}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </label>

            {/* Run / Submit Action Triggers */}
            <div className="actions">
              <button type="button" onClick={handleRunCode}>
                Run
              </button>
              <button type="button" className="primary" onClick={handleSubmitCode}>
                Submit
              </button>
            </div>
          </div>

          {/* Code text editor area */}
          <textarea
            id="code-editor"
            spellCheck="false"
            value={code} // Bind value to React state (controlled component)
            onChange={(e) => setCode(e.target.value)} // Update state on key presses
          />

          {/* Results section displaying run / submission status */}
          <ResultsDisplay runResult={runResult} submitResult={submitResult} />
        </article>
      </div>
    </section>
  );
}
