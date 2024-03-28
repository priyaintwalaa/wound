const { addPatient } = require("../service/patient")

exports.createPatient = async (req,res) =>{
    const data = req.body
    await addPatient(data)
    res.status(200).json({message:"Patient succesfully created"})
}