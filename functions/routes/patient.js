const express = require('express')
const { requireSignIn } = require('../middleware/authMiddleware')
const {createPatient}= require('../controller/patient')

const router = express.Router()

router.post('/',requireSignIn,createPatient)

module.exports = router