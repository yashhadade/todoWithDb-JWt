const express=require("express");
// const jwt=require("jsonwebtoken");
const cors=require('cors');
const {auth,JWT_SECRET}=require("./auth")
const mongoose=require("mongoose");
const {UserModel,TodoModel}=require("./db");

mongoose.connect("mongodb+srv://yash:Admin123@cluster0.9zrrn.mongodb.net/todo-app-database")
const app=express()
app.use(express.json());
app.use(cors());

app.post("/signUp",async function(req,res){
const email=req.body.email;
const password=req.body.password;
const name=req.body.name;
await UserModel.create({
    email:email,
    password:password,
    name:name
})
res.json({
    message:"New User are Created"
})
})


app.post("/signIn",async function(req,res){
    const email=req.body.email;
    const password=req.body.password;
    const user=await UserModel.findOne({
        email:email,
        password:password
    })
    console.log(user);
    
    if(user){
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