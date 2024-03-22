const express = require('express')
const { requireSignIn } = require('../middleware/authMiddleware')
const { createOrderController, getOrderByDays } = require('../controller/order')

const router = express.Router()

router.get('/',requireSignIn,getOrderByDays)
router.post('/',requireSignIn,createOrderController)

module.exports = router