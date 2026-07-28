import React from "react";

// ResultsDisplay handles printing the output blocks of test-runs and submits.
export default function ResultsDisplay({ runResult, submitResult }) {
  
  // 1. Render results for "Run Code" action (checking visible tests)
  if (runResult) {
    return (
      <section className="results">
        <h3>
          Run Results: {runResult.passedTests}/{runResult.totalTests} passed
        </h3>
        
        {/* Render status card for each visible test case */}
        {(runResult.results || []).map((res, index) => (
          <div key={index} className={`result-row ${res.status}`}>
            <strong>
              Case {index + 1}: {res.status}
            </strong>
            <pre>
              Input: {res.input}
              {"\n"}Expected: {res.expectedOutput}
              {"\n"}Actual: {res.actualOutput}
              {res.error ? `\nError: ${res.error}` : ""}
            </pre>
          </div>
        ))}
      </section>
    );
  }

  // 2. Render results for "Submit Code" action (checking hidden/all tests)
  if (submitResult) {
    const submission = submitResult.submission;
    return (
      <section className="results">
        <h3>Submission: {submission.status}</h3>
        <p>
          {submission.testCasesPassed}/{submission.testCasesTotal} tests passed - {submission.runtime}ms runtime
        </p>
        
        {/* Print error traces if compilation/execution failed */}
        {submission.errorMessage && <pre>{submission.errorMessage}</pre>}
      </section>
    );
  }

  // If code hasn't been run or submitted yet, render nothing
  return null;
}
