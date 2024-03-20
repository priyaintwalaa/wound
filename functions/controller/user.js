const bcrypt = require("bcrypt");
require("dotenv").config();
const { generateEmailService } = require("../service/generate-email");
const admin = require("firebase-admin");
const { generatePasswordService } = require("../service/generate-password");
const { checkEmailExists, passwordHashing, addUser, passwordCorrect, emailCorrect, isDisabledCheck, jwtTokenGenerate, updatePassword, adminCheck } = require("../service/user");
const userCollection = "users";


exports.registerController = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const { email, password, role } = req.body;

    // const userDoc = await firestore.collection(userCollection).doc(email).get();
    // if (userDoc.exists) {
    //   return res.status(400).json({ error: "Email already exists" });
    // }
    await checkEmailExists(firestore,userCollection,email,res)

    // const hashPassword = await bcrypt.hash(password, 10);
    // console.log(hashPassword, "pass");
    const hashPassword = await passwordHashing(password)

    // const newDoc = await firestore.collection(userCollection).doc(email).set({
    //   email,
    //   password: hashPassword,
    //   role,
    //   isDisabled: false,
    // });
    const newDoc = await addUser(firestore,userCollection,email,hashPassword,role)

    res.status(201).send(`Created a new user: ${newDoc}`);
  } catch (error) {
    res.status(400).json({ error, message: "error" });
  }
};

exports.loginController = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const { email, password } = req.body;

    // const userDoc = await firestore.collection(userCollection).doc(email).get();
    // if (!userDoc.exists) {
    //   return res.status(400).json({ error: "Invalid email or password" });
    // }
    const userDoc = await emailCorrect(firestore,userCollection,email,res)

    const userData = userDoc.data();
    await isDisabledCheck(userData,res)
    // if (userData.isDisabled == true) {
    //   return res
    //     .status(400)
    //     .json({ error: "Your account has been deactivated" });
    // }

    const hashedPassword = userData.password;

    // const passwordMatch = await bcrypt.compare(password, hashedPassword);
    // if (!passwordMatch) {
    //   return res.status(400).json({ error: "Invalid email or password" });
    // }
    await passwordCorrect(password,hashedPassword)

    // const token = jwt.sign({ email, role: userData.role }, process.env.SECRET, {
    //   expiresIn: "10h",
    // });
    const token = await jwtTokenGenerate(email,userData.role)

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(400).json({ error: "Failed to login user" });
  }
};

exports.addAdminController = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const user = req.user;
    const { email, role } = req.body;

    const temporaryPass = generatePasswordService();

    // const hashPassword = await bcrypt.hash(temporaryPass, 10);
    const hashPassword = await passwordHashing(temporaryPass,10)

    const newDoc = await addUser(firestore,userCollection,email,hashPassword,role)
    // const newDoc = await firestore.collection(userCollection).doc(email).set({
    //   email,
    //   password: hashPassword,
    //   role,
    // });
    console.log("before email")
   const data = await generateEmailService(email, temporaryPass, user)
    console.log("after email")
   
    res.status(200).json({ data: { email: newDoc.email, role: newDoc.role } })
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.updatePasswordController = async (req, res) => {
  try {
    const firestore = admin.firestore();

    const data = req.user;
    const { currentPassword, newPassword } = req.body;
    const email = data.email;
    // const userDoc = await firestore.collection(userCollection).doc(email).get();
    const userDoc = await emailCorrect(firestore,userCollection,email,res)

    const userData = userDoc.data();
    const hashedPassword = userData.password;

    // const passwordMatch = await bcrypt.compare(currentPassword, hashedPassword);
    // console.log(passwordMatch);
    // if (!passwordMatch) {
    //   return res.status(400).json({ error: "Invalid email or password" });
    // }
    await passwordCorrect(currentPassword,hashedPassword)

    // const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const newHashedPassword = await passwordHashing(newPassword)
    // await firestore
    //   .collection(userCollection)
    //   .doc(email)
    //   .update({ password: newHashedPassword });
    const update = await updatePassword(firestore,userCollection,email,newHashedPassword) 

    return res.status(200).json({ userDoc: userData, data: update });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deactivateUserController = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const user = req.user;
    const email = user.email;

    const { deactivateUser } = req.body;

    // const userDoc = await firestore.collection(userCollection).doc(email).get();
    const userDoc = await emailCorrect(firestore,userCollection,email,res)
    const userData = userDoc.data();

    // if (userData.role !== "admin") {
    //   return res
    //     .status(400)
    //     .json({ message: "You are not admin. Only admins have the access" });
    // }
    await adminCheck(userData.role,res)

    // const deactivateuserDoc = await firestore
    //   .collection(userCollection)
    //   .doc(deactivateUser)
    //   .get();
    // if (!deactivateuserDoc.exists) {
    //   return res.status(400).json({ error: "Invalid email or password" });
    // }
    const deactivateuserDoc = await emailCorrect(firestore,userCollection,deactivateUser,res)
    const result = deactivateuserDoc.data();
   

    // if (result.isDisabled == true) {
    //   return res
    //     .status(400)
    //     .json({ message: "This user account is already disabled" });
    // }
    await isDisabledCheck(result,res)

    // await firestore
    //   .collection(userCollection)
    //   .doc(deactivateUser)
    //   .update({ isDisabled: true });
    const updated = await deactivateUser(firestore,userCollection,deactivateUser,true)

    return res.status(200).json({ userDoc: result , update:"Updated succesfully" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteUserController = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const user = req.user;
    const email = user.email;

    const { deleteUser } = req.body;

    // const userDoc = await firestore.collection(userCollection).doc(email).get();
    const userDoc = await emailCorrect(firestore,userCollection,email)
    const userData = userDoc.data();

    // if (userData.role !== "admin") {
      //   return res
      //     .status(400)
      //     .json({ message: "You are not admin. Only admins have the access" });
      // }
    await adminCheck(userData.role,res)
    
    // await firestore.collection(userCollection).doc(deleteUser).delete();
    await deleteUser(firestore,userCollection,deleteUser)

    return res.status(200).json({ message: "Succesfully deleted" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
