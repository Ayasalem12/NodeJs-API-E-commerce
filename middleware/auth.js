const jwt =require('jsonwebtoken')

exports.auth=(req,res,next)=>{
    const {authorization}=req.headers
    if(!authorization){
        return res.status(401).json({status:"fail",message:'you must login first!'})
    }
    try{
        let decoded = jwt.verify(authorization,process.env.SECRET_KEY)
        console.log(decoded)
        req.id = decoded.id
        req.role = decoded.role
        next()
    }catch(err){
        return res.status(401).json({status:"fail",message:'you must login first uncorrect!'})
    }
}

exports.restrictTo = (...roles) =>{
    return (req,res,next)=>{
        if(!roles.includes(req.role)){
            res.status(403).json({status:"fail",message:'you do not have permission'})
        }
            next()
        }
            
}