import React from "react";

// AiDrawer renders the right-hand panel for conversing with Gemini AI about coding bugs and hints.
export default function AiDrawer({
  user,                 // Logged in user details
  view,                 // Current view state
  activeProblem,        // Selected problem details
  aiOpen,               // Boolean flag indicating drawer visibility
  setAiOpen,            // Action trigger to close drawer
  language,             // Current selected coding language
  runResult,            // Run logs (attached as context)
  submitResult,         // Submit logs (attached as context)
  aiMessages,           // Current list of chat messages
  aiLoading,            // Loading state while waiting for AI response
  handleSendAiMessage   // Form submit action trigger
}) {
  
  // Only display the drawer if the user is logged in, in solve view, viewing a problem, and clicked AI toggle
  if (!user || view !== "solve" || !activeProblem || !aiOpen) return null;

  return (
    <aside className="ai-drawer">
      {/* Header section */}
      <div className="ai-head">
        <div>
          <p className="eyebrow">AI Help</p>
          <h2>{activeProblem.title}</h2>
        </div>
        <button type="button" className="icon-button" onClick={() => setAiOpen(false)} title="Close AI help">
          x
        </button>
      </div>

      {/* Context indicator notes */}
      <div className="ai-context">
        <span>{language}</span>
        <span>
          {runResult ? "Run context attached" : submitResult ? "Submit context attached" : "Code context attached"}
        </span>
      </div>

      {/* Chat messages log scroll view */}
      <div className="ai-messages">
        {aiMessages.length > 0 ? (
          aiMessages.map((msg, index) => (
            <div key={index} className={`ai-message ${msg.role}`}>
              <strong>{msg.role === "user" ? "You" : "AI"}</strong>
              <p>
                {/* Print lines split with linebreaks */}
                {msg.content?.split("\n").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>
          ))
        ) : (
          <p className="empty">Ask for hints, bug checks, edge cases, or complexity help.</p>
        )}

        {/* Typing thinking indicator */}
        {aiLoading && (
          <div className="ai-message assistant">
            <strong>AI</strong>
            <p>Thinking...</p>
          </div>
        )}
      </div>

      {/* Message inputs form */}
      <form className="ai-form" onSubmit={handleSendAiMessage}>
        <textarea name="message" required placeholder="Ask about your approach, bug, or a test case" />
        <button type="submit" className="primary" disabled={aiLoading}>
          {aiLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </aside>
  );
}
