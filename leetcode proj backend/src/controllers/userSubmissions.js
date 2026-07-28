const Problem = require("../models/problems");
const Submission = require('../models/submissions');
const {executeCode} = require('../utils/problemUtility');
const submitCode = async (req,res)=>{
    try{
        const userId=req.result._id;//was stored in req , when the userAuthentication was done
        const problemId=req.params.id;//from the link paramter ..../:id

        const {code,language}= req.body;

        if (!userId || !code || !problemId || !language)
        {
            return res.status(400).send("Some field missing");
        }
        //fetching the problem from DB,bcs we need hidden test cases from our DB to check the user soln
        const problem= await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        // we will store the submission made be the user (from frontend) first , and then call the piston(0r judge0)
        // bcs it may be possible that if we directly call the piston (before storing it inside DB ) , then if judge0 crashes 
        // then the data sent by user will be lost , so we will first store the code in db , then call judge0 and then again
        // store the result in DB

        //storing inside DB, skipped this
        

        const allTestCases = [
            ...problem.visibleTestCases, 
            ...problem.hiddenTestCases
        ];

        let totalRuntime = 0;
        let testCasesPassed = 0;
        let status = "accepted";
        let finalErrorMessage = "";

        // 2. Iterate through ALL test cases
        for (const [index, testCase] of allTestCases.entries()) {
            
            // Measure Time (Simple approximation)
            const startTime = Date.now();
            
            // Execute on JDoodle
            const result = await executeCode(language, code, testCase.input);
            
            const endTime = Date.now();
            const executionTime = endTime - startTime; // Time in ms
            totalRuntime += executionTime;

            // A. Check for Runtime/Compile Errors
            if (result.code !== 0) {
                status = "error";
                finalErrorMessage = result.stderr; // Save the error from JDoodle
                break; // Stop testing on first error
            }

            // B. Check Output Logic
            const actualOutput = (result.stdout || "").trim();
            const expectedOutput = (testCase.output || "").trim();

            if (actualOutput !== expectedOutput) {
                status = "wrong"; // Wrong Answer
                // Optional: Save which input failed for debugging
                finalErrorMessage = `Failed at Test Case ${index + 1}`; 
                break; // Stop testing on first failure
            }

            // If we got here, this test case passed
            testCasesPassed++;
        }

        // 3. Create Submission Record
        const newSubmission = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status,
            testCasesPassed,
            testCasesTotal: allTestCases.length,
            runtime: status === "accepted" ? Math.floor(totalRuntime / allTestCases.length) : 0, // Average runtime
            errorMessage: finalErrorMessage,
            memory: 0
        });

        //we will save the problem in problemSoved of user schema if prblm is not saved already
        const alreadySolved = req.result.problemSolved.some((id) => id.toString() === problemId);
        if(status === "accepted" && !alreadySolved)
        {
            req.result.problemSolved.push(problemId)
            await req.result.save();
        }


        // 4. Send Response
        res.status(200).json({
            message: "Submission Processed",
            submission: newSubmission
        });



    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: err.message });
    }

}

const runCode = async (req, res) => {
    try {

        const problemId=req.params.id;//from the link paramter ..../:id

        const { code, language } = req.body;

        if (!code || !problemId || !language) {
            return res.status(400).send("Missing code, language, or problem ID");
        }

        // 1. Fetch Problem (Only for visible test cases)
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        // ONLY use visible test cases
        const testCasesToRun = problem.visibleTestCases; 
        
        // Store detailed results for each test case to send back to frontend
        const results = []; 

        // 2. Iterate through visible test cases
        for (const [index, testCase] of testCasesToRun.entries()) {
            
            // Execute on JDoodle
            const result = await executeCode(language, code, testCase.input);
            
            // Prepare the result object for this specific test case
            const caseResult = {
                input: testCase.input,
                expectedOutput: testCase.output.trim(),
                actualOutput: (result.stdout || "").trim(),
                status: "passed",
                error: null
            };

            // A. Check for Runtime/Compile Errors
            if (result.code !== 0) {
                caseResult.status = "error";
                caseResult.error = result.stderr; // Send error message back
            } 
            // B. Check Output Logic
            else if (caseResult.actualOutput !== caseResult.expectedOutput) {
                caseResult.status = "wrong";
            }

            results.push(caseResult);
        }

        // 3. Send Response (NO DB SAVING)
        // We send back the array of results so the frontend can show "Case 1: Passed", "Case 2: Failed"
        res.status(200).json({
            message: "Run complete",
            totalTests: testCasesToRun.length,
            passedTests: results.filter(r => r.status === "passed").length,
            results: results 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userId', 'firstName emailId')
            .populate('problemId', 'title difficulty tags');

        res.status(200).json(submissions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.result._id })
            .sort({ createdAt: -1 })
            .populate('problemId', 'title difficulty tags');

        res.status(200).json(submissions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const getMySubmissionsByProblem = async (req, res) => {
    try {
        const { problemId } = req.params;
        if (!problemId) {
            return res.status(400).json({ message: "Problem ID is required" });
        }

        const submissions = await Submission.find({
            userId: req.result._id,
            problemId
        })
            .sort({ createdAt: -1 })
            .populate('problemId', 'title difficulty tags');

        res.status(200).json(submissions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {submitCode,runCode,getAllSubmissions,getMySubmissions,getMySubmissionsByProblem};
