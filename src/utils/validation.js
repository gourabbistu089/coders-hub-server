
const validateSignUpData = (req) =>{
    const {firstname, lastname, email, password} = req.body;

    if(!firstname || !lastname || !email || !password){
        throw new Error("All Fields are required")
    }
}
const validateProfileData = (req) =>{
    const allowedFields = [
        "firstname",
        "lastname",
        "photoUrl",
        "about",
        "gender",
        "age",
        "skills",
      ];
      const isEditProfileData = Object.keys(req.body).every(field => allowedFields.includes(field))
      return isEditProfileData;
}
module.exports = {
    validateSignUpData,
    validateProfileData,
}