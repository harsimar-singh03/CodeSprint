const Problem = require('../models/problems');
const Submission = require('../models/submissions');
const { executeCode } = require('../utils/problemUtility');

const createProblem = async (req, res) => {
    try {
        const { 
            title, description, difficulty, tags, 
            visibleTestCases, hiddenTestCases, referenceSolution, problemCreator ,startCode
        } = req.body;
        const allTestCases = [
            ...(visibleTestCases || []),
            ...(hiddenTestCases || [])
        ];

        console.log(`Creating Problem: ${title}`);

        // --- VALIDATION STEP ---
        // Iterate through every Reference Solution (e.g., C++, Java)
        for (const solution of referenceSolution) {
            const { language, initialCode } = solution;
            console.log(`> Verifying ${language} solution...`);

            // Check this solution against EVERY test case
            for (const [index, testCase] of allTestCases.entries()) {
                
                // 1. Run code on JDoodle
                const result = await executeCode(language, initialCode, testCase.input);

                // 2. Check for Compile Errors
                if (result.code !== 0) {
                    return res.status(400).json({
                        message: `Reference Solution Error in ${language}`,
                        error: result.stderr
                    });
                }

                // 3. Compare Output (Trim whitespace)
                const actual = (result.stdout || "").trim();
                const expected = (testCase.output || "").trim();

                if (actual !== expected) {
                    return res.status(400).json({
                        message: `Validation Failed for ${language} at Test Case #${index + 1}`,
                        input: testCase.input,
                        expected: expected,
                        actual: actual
                    });
                }
            }
        }
        console.log("All validations passed!");

        // --- SAVE TO DB ---
        const newProblem = await Problem.create({
            title,
            description,
            difficulty,
            tags,
            startCode,
            visibleTestCases,
            hiddenTestCases,
            referenceSolution,
            problemCreator: req.body.problemCreator || (req.result ? req.result._id : null) // Normally comes from req.user._id
        });

        res.status(201).json({
            message: "Problem validated and created successfully",
            problemId: newProblem._id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const updateProblem = async (req,res)=>{

    
        const { 
            title, description, difficulty, tags, 
            visibleTestCases, hiddenTestCases, referenceSolution, problemCreator 
        } = req.body;
        const allTestCases = [
            ...(visibleTestCases || []),
            ...(hiddenTestCases || [])
        ];

    try{
        
                const {id}=req.params;
                if(!id){
                    return res.status(400).send("missing Id field")
                }

                const dsaProblem = await Problem.findById(id);
                if(!dsaProblem)
                {
                    return res.status(400).send("id missing")

                }
        // --- VALIDATION STEP ---
        // Iterate through every Reference Solution (e.g., C++, Java)
        for (const solution of referenceSolution) {
            const { language, initialCode } = solution;
            console.log(`> Verifying ${language} solution...`);

            // Check this solution against EVERY test case
            for (const [index, testCase] of allTestCases.entries()) {
                
                // 1. Run code on JDoodle
                const result = await executeCode(language, initialCode, testCase.input);

                // 2. Check for Compile Errors
                if (result.code !== 0) {
                    return res.status(400).json({
                        message: `Reference Solution Error in ${language}`,
                        error: result.stderr
                    });
                }

                // 3. Compare Output (Trim whitespace)
                const actual = (result.stdout || "").trim();
                const expected = (testCase.output || "").trim();

                if (actual !== expected) {
                    return res.status(400).json({
                        message: `Validation Failed for ${language} at Test Case #${index + 1}`,
                        input: testCase.input,
                        expected: expected,
                        actual: actual
                    });
                }
            }
        }
        
        const newProblem=await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});

        res.status(200).send(newProblem);

    }
    catch(err){
        res.status(404).send("Error:"+err);
    }
}

const deleteProblem=async (req,res)=>{

    const {id}=req.params;
    try{
        if(!id){
            return res.status(400).send("id not exist")
        }

        const deletePrblm=await Problem.findByIdAndDelete(id);
        if(!deletePrblm)
        {
            return res.status(400).send("problem doesnt exist");
        }

        res.status(200).send("problem deleted successfully")
    }
    catch(err){
        return res.status(400).send("Error:"+err);
    }

}

const getProblemById=async (req,res)=>{

    const {id}=req.params;
    try{
        if(!id){
            return res.status(400).send("id not exist")
        }

        const getPrblm=await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode');
        if(!getPrblm)
        {
            return res.status(400).send("problem doesnt exist");
        }

        res.status(200).send(getPrblm);
    }
    catch(err){
        return res.status(400).send("Error:"+err);
    }

}

const getAllProblem=async (req,res)=>{

    try{
      //  this will fetch all the problem , will also result in slowing things , i.e bad experience for users , we will use concept "pagination" 
        const getPrblm=await Problem.find({}).select('_id title difficulty tags');
        if(!getPrblm.length===0)
        {
            return res.status(400).send("problem doesnt exist");
        }
        //
        res.status(200).send(getPrblm);

        //we will use here pagination localhost:3000/problem/getAllProblem?page=2&limit=10
        //const problems = await Problem.find().skip(skip).limit(limit);

    }
    catch(err){
        return res.status(400).send("Error:"+err);
    }

}

const solvedAllProblemByUser= async (req,res)=>{
    try{
        const userId = req.result._id;

        const submissions = await Submission.find({ userId, status: "accepted" })
            .sort({ createdAt: -1 })
            .populate('problemId', '_id title difficulty tags');

        const solvedMap = new Map();
        submissions.forEach((submission) => {
            if (submission.problemId) {
                solvedMap.set(submission.problemId._id.toString(), submission.problemId);
            }
        });

        res.send([...solvedMap.values()])

    }
    catch(err)
    {
        res.status(500).send("server error");
    }
}

module.exports =  {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser} ;
