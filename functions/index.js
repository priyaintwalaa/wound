/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const {onRequest} = require('firebase-functions/v2/https')
const {registerController,loginController,addNewAdmin, updatePassword} = require('./controller/user')
const {adminAuthorization,requireSignIn} = require('./middleware/authMiddleware')

const admin = require('firebase-admin')
const express = require('express')
const serviceAccount = require('./wound-firebase-firebase-adminsdk-dgmii-ee346eaa6c.json')

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
    databaseURL: 'https://wound-firebase.firebaseio.com'
})

const app = express()

app.post('/register',registerController)
app.post('/login',loginController)
app.post('/addAdmin',requireSignIn,adminAuthorization,addNewAdmin)
app.post('/updatePass',requireSignIn,updatePassword)

exports.wound = onRequest(app)