const validator=require("validator")

const validate=(data)=>{

    const mandatoryField =['firstName','password','emailId'];

    //wether mandatory field are present 
    const IsAllowed=mandatoryField.every((k)=>{
        return Object.keys(data).includes(k)})
    if(!IsAllowed)
    {
        throw new Error("some field missing")
    }

    //email verification
   if(!validator.isEmail(data.emailId)) 
   {
    throw new Error("email invalid")
   }

   if(!validator.isStrongPassword(data.password)) 
   {
    throw new Error("password invalid")
   }

   if(!validator.isLength(data.firstName, { min: 3, max: 20 })) 
   {
    throw new Error("name invalid")
   }

}
module.exports=validate;