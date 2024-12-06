const express=require("express");
 const jwt=require("jsonwebtoken");
const cors=require('cors');
const bcrypt=require('bcrypt');
const {auth,JWT_SECRET}=require("./auth")
const mongoose=require("mongoose");
const {UserModel,TodoModel}=require("./db");
const {z}=require("zod");

mongoose.connect("mongodb+srv://yash:Admin123@cluster0.9zrrn.mongodb.net/todo-app-database")
const app=express()
app.use(express.json());
app.use(cors());

app.post("/signUp",async function(req,res){
    const requireBody=z.object({
        email:z.string().min(5).max(100).email(),
        name:z.string().min(4).max(100),
        password:z.string().min(8).max(100)
    })
    const parseData=requireBody.safeParse(req.body)
    if(!parseData.success){
        res.json({
            message:"Please Check Your Email Password and userName",
            error:parseData.error
        })
        return
    }
const email=req.body.email;
const password=req.body.password;
const name=req.body.name;
// if(typeof email !=="string"|| email.length<5||email.includes("@")){
//     res.json({
//         message:"Enter Correct Email Id"
//     })
//     return
// }
let errorThrow=false;
try{
const hashPassword=await bcrypt.hash(password,5);
console.log(hashPassword);
 await UserModel.create({
    email:email,
    password:hashPassword,
    name:name
})
}catch(e){
res.json({
    message:"User already exist",
   
})
errorThrow=true;
}
if(!errorThrow){
    res.json({
        message:"New User are Created"
    })
}

})


app.post("/signIn",async function(req,res){
    const email=req.body.email;
    const password=req.body.password;
    const user=await UserModel.findOne({
        email:email,
    })
    if(!user){
        res.status(403).json({
            message:"User does't exist"
        })
        return
    }
    const passswordMathc= await bcrypt.compare(password,user.password)
    console.log(user);
    
    if(passswordMathc){
        const token=jwt.sign({
        id:user._id.toString()
        },JWT_SECRET)
        res.json({
            token:token,
        })
    }else{
        res.status(403).json({
            message:"Incorrect credentails"
        })
    }
})

app.post("/create/todo",auth, async function(req,res){
    const userId=req.userId;
    const title=req.body.title;
    const done=req.body.done;
    await TodoModel.create({
        userId,
        title,
        done,
    })
    res.json({
        message:"Todo created",
    })

})

app.get("/all/todo",auth,async function(req,res){
    const userId=req.userId;
    const todos=await TodoModel.find({
        userId:userId,
    })
    res.json({
        todos:todos
    })
})



app.listen(3000,function(){
    console.log("Server is running on port 3000");
})