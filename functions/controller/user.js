const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET = "ABC";
const { sendTemporaryCredEmail } = require("./email");
const { getAuth, updatePassword } = require("firebase/auth");
const admin = require("firebase-admin");
const userCollection = "users";
// const firebase = require("firebase/app");

function generateTemporaryPassword(length = 7) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let temporaryPassword = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    temporaryPassword += charset[randomIndex];
  }
  return temporaryPassword;
}

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
    });

    console.log(newDoc.email);
    console.log(newDoc.password);
    res.status(201).send(`Created a new user: ${newDoc.role}`);
  } catch (error) {
    res.status(400).json({ error, message: "error" });
  }
};

exports.loginController = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const { email, password } = req.body;

    // Check if the user exists in the database
    const userDoc = await firestore.collection(userCollection).doc(email).get();
    if (!userDoc.exists) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const userData = userDoc.data();
    const hashedPassword = userData.password;

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    // Passwords match, authentication successful
    const token = jwt.sign({ email, role: userData.role }, SECRET, {
      expiresIn: "10h",
    });

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(400).json({ error: "Failed to login user" });
  }
};

exports.addNewAdmin = async (req, res) => {
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
};

exports.updatePassword = async (req, res) => {
  const firestore = admin.firestore();

  const data = req.user;
  const { currentPassword, newPassword } = req.body;
  const email = data.email;
  const userDoc = await firestore.collection(userCollection).doc(email).get();

  const userData = userDoc.data();
  const hashedPassword = userData.password;

  const passwordMatch = await bcrypt.compare(currentPassword, hashedPassword);
  console.log(passwordMatch)
  if (!passwordMatch) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  await firestore.collection(userCollection).doc(email).update({ password: newHashedPassword });
 
  return res
    .status(200)
    .json({ userDoc: userData });
};
