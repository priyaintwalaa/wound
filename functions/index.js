// const {onRequest} = require('firebase-functions/v2/https')
// const admin = require('firebase-admin')
// const express = require('express')
// const serviceAccount = require('./wound-firebase-firebase-adminsdk-dgmii-9478856c69.json')
// // const indexRoutes = require('../functions/routes/index')
// const userRoutes = require('./routes/user')
// const orderRoutes = require('./routes/order')
// const patientsRoutes = require('./routes/patient')

// // 'https://wound-firebase.firebaseio.com'
// admin.initializeApp({
//     credential:admin.credential.cert(serviceAccount),
//     databaseURL: 'https://console.firebase.google.com/project/wound-firebase/firestore'
// })

// const app = express()

// app.use(express.json())

// // app.use('/',indexRoutes)
// app.use('/',userRoutes)
// app.use('/order',orderRoutes)
// app.use('/patient',patientsRoutes)

// exports.wound = onRequest(app)
const {onRequest} = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const express = require('express')
const serviceAccount = require('./wound-firebase-firebase-adminsdk-dgmii-ee346eaa6c.json')
const userRoutes = require('./routes/user')
const orderRoutes = require('./routes/order')
const patientsRoutes = require('./routes/patient')

admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
    databaseURL: 'https://console.firebase.google.com/project/wound-firebase/firestore'
})

const app = express()

app.use(express.json())

app.use('/',userRoutes)
app.use('/order',orderRoutes)
app.use('/patient',patientsRoutes)

exports.wound = onRequest(app)