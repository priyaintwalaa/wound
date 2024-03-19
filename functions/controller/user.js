const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { sendTemporaryCredEmail } = require("./email");
const admin = require("firebase-admin");
const userCollection = "users";
const generateTemporaryPassword = require("../helper/config");

exports.registerController = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const { email, password, role } = req.body;

    const userDoc = await firestore.collection(userCollection).doc(email).get();
    if (userDoc.exists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword, "pass");

    const newDoc = await firestore.collection(userCollection).doc(email).set({
      email,
      password: hashPassword,
      role,
      isDisabled: false,
    });

    res.status(201).send(`Created a new user: ${newDoc}`);
  } catch (error) {
    res.status(400).json({ error, message: "error" });
  }
};

exports.loginController = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const { email, password } = req.body;

    const userDoc = await firestore.collection(userCollection).doc(email).get();
    if (!userDoc.exists) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const userData = userDoc.data();
    if (userData.isDisabled == true) {
      return res
        .status(400)
        .json({ error: "Your account has been deactivated" });
    }

    const hashedPassword = userData.password;

    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ email, role: userData.role }, process.env.SECRET, {
      expiresIn: "10h",
    });

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(400).json({ error: "Failed to login user" });
  }
};

exports.addNewAdmin = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const user = req.user;
    const { email, role } = req.body;

    const temporaryPass = generateTemporaryPassword();

    const hashPassword = await bcrypt.hash(temporaryPass, 10);

    const newDoc = await firestore.collection(userCollection).doc(email).set({
      email,
      password: hashPassword,
      role,
    });
    await sendTemporaryCredEmail(email, temporaryPass, user);

    res.status(200).json({ data: { email: newDoc.email, role: newDoc.role } });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const firestore = admin.firestore();

    const data = req.user;
    const { currentPassword, newPassword } = req.body;
    const email = data.email;
    const userDoc = await firestore.collection(userCollection).doc(email).get();

    const userData = userDoc.data();
    const hashedPassword = userData.password;

    const passwordMatch = await bcrypt.compare(currentPassword, hashedPassword);
    console.log(passwordMatch);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await firestore
      .collection(userCollection)
      .doc(email)
      .update({ password: newHashedPassword });

    return res.status(200).json({ userDoc: userData });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const user = req.user;
    const email = user.email;

    const { deactivateUser } = req.body;

    const userDoc = await firestore.collection(userCollection).doc(email).get();
    const userData = userDoc.data();

    if (userData.role !== "admin") {
      return res
        .status(400)
        .json({ message: "You are not admin. Only admins have the access" });
    }

    const deactivateuserDoc = await firestore
      .collection(userCollection)
      .doc(deactivateUser)
      .get();
    const result = deactivateuserDoc.data();
    if (!deactivateuserDoc.exists) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (result.isDisabled == true) {
      return res
        .status(400)
        .json({ message: "This user account is already disabled" });
    }

    await firestore
      .collection(userCollection)
      .doc(deactivateUser)
      .update({ isDisabled: true });

    return res.status(200).json({ userDoc: result });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const user = req.user;
    const email = user.email;

    const { deleteUser } = req.body;

    const userDoc = await firestore.collection(userCollection).doc(email).get();
    const userData = userDoc.data();

    if (userData.role !== "admin") {
      return res
        .status(400)
        .json({ message: "You are not admin. Only admins have the access" });
    }
    await firestore.collection(userCollection).doc(deleteUser).delete();

    return res.status(200).json({ message: "Succesfully deleted" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
