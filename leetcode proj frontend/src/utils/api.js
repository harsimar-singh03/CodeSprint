// The base URL where our backend server is running
export const API_BASE = "http://localhost:3000";

// A template for creating a new coding problem in the admin panel
export const sampleProblem = {
  visibleTestCases: [
    { input: "2 3", output: "5", explanation: "2 + 3 = 5" }
  ],
  hiddenTestCases: [
    { input: "10 20", output: "30" }
  ],
  startCode: [
    {
      language: "cpp",
      initialCode: "int sum(int a, int b) {\n  // Write your code here\n  return a + b;\n}"
    }
  ],
  referenceSolution: [
    {
      language: "cpp",
      initialCode: "int sum(int a, int b) {\n  return a + b;\n}"
    }
  ]
};

// Converts language names (like "C++" or "JS") to standard lowercase keys
export const normalizeLanguage = (language = "") => {
  const value = String(language).toLowerCase();
  if (value === "js" || value === "javascript") return "javascript";
  if (value === "c++" || value === "cpp") return "cpp";
  return value;
};

// Formats objects into neat JSON strings with 2-space indentation
export const formatJson = (value) => JSON.stringify(value, null, 2);

// Returns CSS classes based on problem difficulty levels
export const difficultyClass = (difficulty) => `pill ${String(difficulty || "").toLowerCase()}`;

// Global helper for calling API routes on the backend.
// It automatically appends user session cookies (credentials: "include") and converts responses.
export const api = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // Send/receive cookies for login sessions
    headers: { 
      "Content-Type": "application/json", 
      ...(options.headers || {}) 
    },
    ...options
  });

  const text = await response.text();
  
  // Safely parse JSON if response is JSON, otherwise return text
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  // If HTTP status is not 200-299, throw an error to be caught by our catch blocks
  if (!response.ok) {
    const errorMsg = typeof data === "string" ? data : data?.message || data?.error || "Request failed";
    throw new Error(errorMsg);
  }

  return data;
};
