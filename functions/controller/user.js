const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const { SECRET } = require("../helper/config");
const SECRET = "ABC"
const { sendTemporaryCredEmail } = require("./email");
const { getAuth, updatePassword } = require("firebase/auth");
const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');

const userCollection = 'users'

exports.registerController = async (req, res) => {
  const firestore = admin.firestore()
  try {
    const data = req.body
    // const user = {
    //     email: req.body.email,
    //     password:req.body.password,
    //     role:req.body.role,
    // }

    const newDoc = await firestore.collection(userCollection).add(data);
    res.status(201).send(`Created a new user: ${newDoc.id}`);
} catch (error) {
    res.status(400).send(`User should cointain firstName, lastName, email, areaNumber, department, id and contactNumber!!!`)
}
};

  // const { email, password, role } = req.body;

  // const existingUser = await admin.auth().getUserByEmail(email);
  // if (existingUser) {
  //   return res.status(400).json({ error: "Email already exists" });
  // }
  // const hashPassword = await bcrypt.hash(password, 10);
  // console.log(hashPassword)

  // const data = await admin.auth().createUser({
  //   email,
  //   password,
  //   role,
  // });

  // res.status(200).json({ data });

// exports.loginController = async (req, res) => {
//   const { email, password } = req.body

//   const user = await admin.auth().getUserByEmail(email);
//   console.log(user,"user")

//   if (!user) {
//     return res.status(400).json({ message: "User not found" });
//   }

// const passwordHash = user.passwordHash;

// const parts = passwordHash.split(":");

// let passwordd = "";
// for (const part of parts) {
//     if (part.startsWith("password=")) {
//         // Extract the password after "password="
//         passwordd = part.split("=")[1];
//         break;
//     }
// }
//   const passwordMatch = await bcrypt.compare(password,passwordd)
//   if (!passwordMatch) {
//     return res.status(400).json({ message: "Password not match" });
//   }

//   console.log(user.role,"role")
//   console.log(user,"user")
//   const token = jwt.sign({ email, role: user.role }, SECRET, {
//     expiresIn: "10h",
//   });
//   res.status(200).json({ token, message: "Login successful" });
// };

// exports.addNewAdmin = async (req, res) => {
//   const user = req.user;

//   const { email, temporaryPass } = req.body;

//   const existingUser = await admin.auth().getUserByEmail(email);
//   if (existingUser) {
//     return res.status(400).json({ error: "Email already exists" });
//   }

//   const hashPassword = await bcrypt.hash(temporaryPass, 10);

//   const data = await admin.auth().createUser({
//     email,
//     password: hashPassword,
//     role,
//   });

//   await sendTemporaryCredEmail(email, temporaryPass, user);

//   res.status(200).json({ data });
// };

// exports.updatePassword = async (req, res) => {
//   // try {
//   const auth = getAuth();
//   const { password } = req.body;

//   const user = auth.currentUser;
//   const newPassword = await bcrypt.hash(password, 10);

//   updatePassword(user, newPassword)
//     .then(() => {
//       res.status(200).json({ user, message: "Successfully password changed" });
//     })
//     .catch((error) => {
//       res.status(400).json({ message: "Password not updated", error });
//     });
//   // const data = req.user

//   // const user = admin.auth().currentUser;

//   // const updatePass = await user.updatePassword(hashPassword);

//   // } catch (error) {

//   // }
// };
