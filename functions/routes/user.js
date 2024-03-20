const express = require('express')
const { registerController, loginController, addNewAdmin, updatePassword, deactivateUser, deleteUser } = require('../controller/user')
const { requireSignIn, adminAuthorization } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register',registerController)
router.post('/login',loginController)
router.post('/addAdmin',requireSignIn,adminAuthorization,addNewAdmin)
router.post('/updatePass',requireSignIn,updatePassword)   //do this to put or patch
router.post('/deactivate',requireSignIn,deactivateUser)
router.delete('/delete',requireSignIn,deleteUser)

module.exports = router
