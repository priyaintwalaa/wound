const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.requireSignIn = async (req, res,next)=>{
    try {
        if(req.headers.authorization){
            const decode = jwt.verify(
                req.headers.authorization,
                process.env.SECRET
            )
            req.user = decode
            next()
        }else{
            res.status(401).json({message:'Unauthorized'})
        }
    } catch (error) {
        console.log(error)
        res.status(401).json({message:'Unauthorized',error})
    }
}

exports.adminAuthorization =  async (req, res,next)=>{
    try {
        if(req.headers.authorization){
            const decode = jwt.verify(
                req.headers.authorization,
                process.env.SECRET
            )
            console.log(decode,"decode")
            if(decode.role == 'admin'){
                req.user = decode
                next()
            }else{
                res.status(401).json({message:'Only admins have access'})
            }
        }else{
            res.status(401).json({message:'Unauthorized'})
        }
    } catch (error) {
        console.log(error)
        res.status(401).json({message:'Unauthorized',error})
    }
}