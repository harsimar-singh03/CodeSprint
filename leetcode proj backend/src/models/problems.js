const mongoose = require('mongoose');
const {Schema} = mongoose;

const problemSchema = new Schema({
title:{
    type:String,
    required:true
    },
description:{
    type:String,
    required:true
    },
difficulty:{
    type:String,
    required:true,
    enum:['easy','medium','hard']
},
tags:{
    type:String,
    // enum:['array','LL','DP','Tress','Graphs'],
    required:true
},
visibleTestCases:[
    {
        input:{required:true,
            type:String
        },
        output:{required:true,
            type:String},
        explanation:{required:true,
            type:String
        }
    }
],
hiddenTestCases:[
    {
        input:{required:true,
            type:String
        },
        output:{required:true,
            type:String
        }
    }
],
startCode:[
    {
        language:{required:true,
            type:String
        },
        initialCode:{required:true,
            type:String},
    }
],
problemCreator:{
    type:Schema.Types.ObjectId,//creating a feature that which admin has created the problem 
    ref:'user',//refer to user schema
    
}
,
referenceSolution:[//contains already a correct solution of each question in each language ,,,,this can be used to check the output of the input which user have provided
    {
        language:{required:true,
            type:String
        },
        initialCode:{required:true,
            type:String},
    }
]
})

const Problem =mongoose.model('problem',problemSchema);
module.exports = Problem;


// referenceSolution=[
//     {language:'c++',initialCode:"dhsbaehh"},
//     {language:'java',initialCode:"dhsbaehh"},
//     {language:'JS',initialCode:"dhsbaehh"}
// ] ----->> this is how referenceSolution will be storing the data