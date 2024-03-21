const { generateEmailService } = require("../service/generate-email");
const admin = require("firebase-admin");
const { generatePasswordService } = require("../service/generate-password");
const {
  checkEmailExists,
  passwordHashing,
  addUser,
  passwordCorrect,
  emailCorrect,
  isDisabledCheck,
  jwtTokenGenerate,
  updatePassword,
  adminCheck,
  deactivateUserService,
  deleteUserService,
} = require("../service/user");
const userCollection = "users";

exports.registerController = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const { email, password, role } = req.body;

    await checkEmailExists(firestore, userCollection, email, res);

    const hashPassword = await passwordHashing(password);

    const newDoc = await addUser(
      firestore,
      userCollection,
      email,
      hashPassword,
      role
    );

    res.status(201).send(`Created a new user: ${newDoc}`);
  } catch (error) {
    res.status(400).json({ error, message: "error" });
  }
};

exports.loginController = async (req, res) => {
  try {
    const firestore = admin.firestore();
    const { email, password } = req.body;

    const userDoc = await emailCorrect(firestore, userCollection, email, res);

    const userData = userDoc.data();
    await isDisabledCheck(userData, res);

    const hashedPassword = userData.password;

    await passwordCorrect(password, hashedPassword, res);

    const token = await jwtTokenGenerate(email, userData.role);

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

    const hashPassword = await passwordHashing(temporaryPass, 10);

    const newDoc = await addUser(
      firestore,
      userCollection,
      email,
      hashPassword,
      role
    );

    const data = await generateEmailService(email, temporaryPass, user);

    res
      .status(200)
      .json({ message: "Succesfully added and mail sent to user" });
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

    const userDoc = await emailCorrect(firestore, userCollection, email, res);

    const userData = userDoc.data();
    const hashedPassword = userData.password;

    await passwordCorrect(currentPassword, hashedPassword, res);

    const newHashedPassword = await passwordHashing(newPassword);

    const update = await updatePassword(
      firestore,
      userCollection,
      email,
      newHashedPassword
    );

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

    const userDoc = await emailCorrect(firestore, userCollection, email, res);
    const userData = userDoc.data();

    await adminCheck(userData.role, res);

    const deactivateuserDoc = await emailCorrect(
      firestore,
      userCollection,
      deactivateUser,
      res
    );
    const result = deactivateuserDoc.data();

    await isDisabledCheck(result, res);

    const updated = await deactivateUserService(
      firestore,
      userCollection,
      deactivateUser,
      true
    );

    return res
      .status(200)
      .json({ userDoc: updated.data(), update: "Updated succesfully" });
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

    const userDoc = await emailCorrect(firestore, userCollection, email);
    const userData = userDoc.data();

    await adminCheck(userData.role, res);

    await deleteUserService(firestore, userCollection, deleteUser);

    return res.status(200).json({ message: "Succesfully deleted" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
