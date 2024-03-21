const express = require('express')
const { requireSignIn } = require('../middleware/authMiddleware')
const { createOrderController, getOrderByDays } = require('../controller/order')

const router = express.Router()

router.post('/',requireSignIn,createOrderController)
router.post('/days',requireSignIn,getOrderByDays)

module.exports = router