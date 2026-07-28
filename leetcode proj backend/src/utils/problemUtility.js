const axios = require('axios');

// JDoodle language configuration.
const LANGUAGES = {
    'cpp': { language: 'cpp17', versionIndex: '0' },
    'c++': { language: 'cpp17', versionIndex: '0' },
    'python': { language: 'python3', versionIndex: '0' },
    'javascript': { language: 'nodejs', versionIndex: '0' },
    'js': { language: 'nodejs', versionIndex: '0' },
    'java': { language: 'java', versionIndex: '0' }
};

const hasMainFunction = (sourceCode) => /\bmain\s*\(/.test(sourceCode);

const parseCppFunctionSignature = (sourceCode) => {
    const match = sourceCode.match(/\b(int|long long|long|double|float|string|bool|char)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{/);
    if (!match) return null;

    const [, returnType, functionName, paramsText] = match;
    const params = paramsText
        .split(',')
        .map((param) => param.trim())
        .filter(Boolean)
        .map((param, index) => {
            const cleaned = param.replace(/\s+/g, ' ');
            const paramMatch = cleaned.match(/^(int|long long|long|double|float|string|bool|char)\s+([A-Za-z_]\w*)$/);
            if (!paramMatch) return null;

            return {
                type: paramMatch[1],
                name: paramMatch[2] || `arg${index}`
            };
        });

    if (params.some((param) => !param)) return null;

    return { returnType, functionName, params };
};

const wrapCppFunctionIfNeeded = (sourceCode) => {
    if (hasMainFunction(sourceCode)) return sourceCode;

    const signature = parseCppFunctionSignature(sourceCode);
    if (!signature) return sourceCode;

    const declarations = signature.params
        .map((param) => `    ${param.type} ${param.name};`)
        .join('\n');
    const reads = signature.params
        .map((param) => `    cin >> ${param.name};`)
        .join('\n');
    const args = signature.params.map((param) => param.name).join(', ');
    const call = signature.returnType === 'void'
        ? `    ${signature.functionName}(${args});`
        : `    cout << ${signature.functionName}(${args});`;

    return `#include <bits/stdc++.h>
using namespace std;

${sourceCode}

int main() {
${declarations}
${reads}
${call}
    return 0;
}`;
};

const prepareSourceCode = (langName, sourceCode) => {
    const normalizedLanguage = langName.toLowerCase();

    if (normalizedLanguage === 'cpp' || normalizedLanguage === 'c++') {
        return wrapCppFunctionIfNeeded(sourceCode);
    }

    return sourceCode;
};

const executeCode = async (langName, sourceCode, input) => {
    const config = LANGUAGES[langName.toLowerCase()];
    if (!config) throw new Error(`Language '${langName}' is not supported.`);

    if (!process.env.JDOODLE_CLIENT_ID || !process.env.JDOODLE_CLIENT_SECRET) {
        throw new Error("JDoodle credentials are missing. Add JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET to .env.");
    }

    const payload = {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: prepareSourceCode(langName, sourceCode),
        stdin: input || '',
        language: config.language,
        versionIndex: config.versionIndex,
        compileOnly: false
    };

    try {
        const response = await axios.post('https://api.jdoodle.com/v1/execute', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = response.data;
        const output = result.output || '';
        const statusCode = Number(result.statusCode);
        const compilationStatus = Number(result.compilationStatus || 0);
        const isExecutionSuccess = result.isExecutionSuccess !== false;
        const hasError = statusCode !== 200 || compilationStatus !== 0 || !isExecutionSuccess;

        return {
            stdout: hasError ? '' : output,
            stderr: hasError ? output : '',
            code: hasError ? 1 : 0,
            time: result.cpuTime,
            memory: result.memory,
            status: {
                statusCode: result.statusCode,
                compilationStatus: result.compilationStatus,
                isExecutionSuccess: result.isExecutionSuccess,
                isCompiled: result.isCompiled
            }
        };
    } catch (error) {
        console.error("JDoodle API Error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw new Error("Failed to execute code on JDoodle.");
    }
};

module.exports = { executeCode };
