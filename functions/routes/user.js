const express = require('express')
const { registerController, loginController, addAdminController, updatePasswordController, deactivateUserController, deleteUserController } = require('../controller/user')
const { requireSignIn, adminAuthorization } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register',registerController)
router.post('/login',loginController)
router.post('/addAdmin',requireSignIn,adminAuthorization,addAdminController)
router.post('/updatePass',requireSignIn,updatePasswordController)   //do this to put or patch
router.post('/deactivate',requireSignIn,deactivateUserController)
router.delete('/delete',requireSignIn,deleteUserController)

module.exports = router
