const jwt=require("jsonwebtoken");
const JWT_SECRET="todoWithBackEnd";

function auth(req,res,next){
    const token =req.headers.token;
    const decodedData=jwt.verify(token,JWT_SECRET);
    if(decodedData){
        req.userId=decodedData.id;
        next();
    }else{
        res.status(403).json({
            message:"You Don't have the permission"
        })
    }
}

module.exports={
    auth,JWT_SECRET
}