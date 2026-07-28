const axios = require('axios');
const Problem = require('../models/problems');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const buildResultContext = (runResult, submitResult) => {
    if (submitResult?.submission) {
        const submission = submitResult.submission;
        return `Last submit result:
Status: ${submission.status}
Tests: ${submission.testCasesPassed}/${submission.testCasesTotal}
Runtime: ${submission.runtime || 0}ms
Error: ${submission.errorMessage || 'none'}`;
    }

    if (runResult) {
        return `Last run result:
Passed: ${runResult.passedTests}/${runResult.totalTests}
Details: ${JSON.stringify(runResult.results || [], null, 2)}`;
    }

    return 'The user has not shared a run or submit result yet.';
};

const getAiHelp = async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ message: 'GROQ_API_KEY is missing in .env' });
        }

        const { problemId, language, code, messages = [], runResult, submitResult } = req.body;
        if (!problemId) {
            return res.status(400).json({ message: 'Problem ID is required' });
        }

        const problem = await Problem.findById(problemId).select('title description difficulty tags visibleTestCases');
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const recentMessages = messages
            .filter((message) => ['user', 'assistant'].includes(message.role) && message.content)
            .slice(-10)
            .map((message) => ({
                role: message.role,
                content: String(message.content).slice(0, 4000)
            }));

        const context = `
Problem:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Tags: ${problem.tags}
Description:
${problem.description}

Visible test cases:
${JSON.stringify(problem.visibleTestCases || [], null, 2)}

User language: ${language || 'unknown'}
User code:
${code || 'No code provided.'}

${buildResultContext(runResult, submitResult)}
`;

        const response = await axios.post(
            GROQ_URL,
            {
                model: process.env.GROQ_MODEL || DEFAULT_MODEL,
                temperature: 0.3,
                max_tokens: 900,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a coding assistant inside a LeetCode-style app. Help the user understand bugs, edge cases, complexity, and next steps. Do not give a full final solution unless the user explicitly asks for it. Use the provided problem, visible tests, current code, and run/submit result as context.'
                    },
                    {
                        role: 'user',
                        content: context
                    },
                    ...recentMessages
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const answer = response.data?.choices?.[0]?.message?.content || 'I could not generate a response.';
        res.status(200).json({ message: answer });
    } catch (err) {
        console.error('Groq help error:', err.response?.data || err.message);
        res.status(500).json({ message: 'AI help failed. Please try again.' });
    }
};

module.exports = { getAiHelp };
