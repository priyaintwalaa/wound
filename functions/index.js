const {onRequest} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const express = require('express')
const serviceAccount = require('./wound-firebase-firebase-adminsdk-dgmii-ee346eaa6c.json')

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
    databaseURL: 'https://wound-firebase.firebaseio.com'
})

const app = express()

app.use('/',userRoutes)

exports.wound = onRequest(app)