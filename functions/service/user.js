const bcrypt = require("bcrypt");
const { firestore } = require("firebase-admin");
// const { firestore } = require("firebase-admin");
require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.checkEmailExists = async (firestore,collectionName,email) =>{
    const userDoc = await firestore.collection(collectionName).doc(email).get();
    if (userDoc.exists) {
      return res.status(400).json({ error: "Email already exists" });
    }
    return userDoc
}

exports.emailCorrect = async (firestore,collectionName,email,res) =>{
    const userDoc = await firestore.collection(collectionName).doc(email).get();
    if (!userDoc.exists) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    return userDoc
}


exports.passwordHashing = async (password) =>{
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword
}
exports.passwordCorrect = async (inputPassword,actualPassword) =>{
    const passwordMatch = await bcrypt.compare(inputPassword, actualPassword);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
}

exports.addUser = async (firestore,collectionName,email,password,role) =>{
    const newDoc = await firestore.collection(collectionName).doc(email).set({
        email,
        password,
        role,
        isDisabled: false,
      });
    return newDoc
}


exports.isDisabledCheck = (data,res) => {
    if (data.isDisabled == true) {
        return res
          .status(400)
          .json({ error: "Your account is deactivated" });
      }
}

exports.jwtTokenGenerate = (email, role ) =>{
    const token = jwt.sign({ email, role}, process.env.SECRET, {
        expiresIn: "10h",
      });
      return token
}

exports.updatePassword = async (firestore,collectionName,email,password)=>{
    const update = await firestore
      .collection(collectionName)
       .doc(email)
       .update({ password });
    return update
}

exports.deactivateUser = async (firestore,collectionName,email,disabled) => {
   const data = await firestore
    .collection(collectionName)
    .doc(email)
    .update({ isDisabled: disabled });

    return data
}

exports.adminCheck = (role,res) => {
    if (role !== "admin") {
        return res
          .status(400)
          .json({ message: "You are not admin. Only admins have the access" });
      }
}

exports.deleteUser = async(firestore,collectionName,email)=>{

    const data = await firestore.collection(collectionName).doc(email).delete();
    return data
}