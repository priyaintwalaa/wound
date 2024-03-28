const express = require('express')
const { requireSignIn } = require('../middleware/authMiddleware')
const { createOrderController, getOrderByDays, ttfSubmission } = require('../controller/order')

const router = express.Router()

router.get('/',requireSignIn,getOrderByDays)
router.post('/:patientId',requireSignIn,createOrderController)
router.get('/:id',requireSignIn,ttfSubmission)

module.exports = router