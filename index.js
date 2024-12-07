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

app.get("/getAlluser",async function(req,res){
    try{
        const Users= await UserModel.find();

        if(Users){
            res.json({
                Users:Users,
            });
        }else{
            res.json({
                message:"No Users Present"
            });
        }
    }catch(error){
        res.status(500).json({
            message:"Error Retrieving",
            error:error.message
        });
    }

})

app.post("/create/todo",auth, async function(req,res){
    const userId=req.userId;
    const title=req.body.title;
    // const done=req.body.done;
    await TodoModel.create({
        userId:userId,
        title:title,
        done:false,
        isDeleted:false,
    })
    res.json({
        message:"Todo created",
    })

})

app.get("/users/notDone/todo",auth,async function(req,res){
    const userId=req.userId;
    const todos=await TodoModel.find({
        userId:userId,
        done:false,
        isDeleted:false,
    })
    res.json({
        todos:todos
    })
})

app.get("/users/done/todo",auth,async function(req,res){
    const userId=req.userId;
    const todos=await TodoModel.find({
        userId:userId,
        done:true,
    })
    res.json({
        todos:todos
    })
})

app.put('/isCompleted/todo/:todoId',auth, async function(req,res){
    const todoId=req.params.todoId;
    
    try{const tododone= await TodoModel.findByIdAndUpdate(
        todoId,
        {done:true},
    );
    if (!tododone) {
        return res.status(404).json({ message: 'Todo not found' });
    }
    res.json({
        message:'Todo Updated SucessFully',
        // todo:tododone
    })
    }catch(err){
        console.error(err);
        res.status(500).json({message:'Server error'});
    }
    
})

app.put("/update/todo/:todoId",auth,async function(req,res){
    const todoId=req.params.todoId;
    const title=req.body.title;
    if(!title){
        return res.status(400).json({ message: "Title is required" });
    }
    try {
        const todoUpdate= await TodoModel.findByIdAndUpdate(
            todoId,
            {title:title}
        )
        if(!todoUpdate){
            return res.status(404).json({message:"Todo not Found"})
        }
        res.json({
            message:"todo is been updated"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Server Error"})
    }
})

app.delete("/deleted/todo/:todoId",auth,async function(req,res){
    const todoId=req.params.todoId;
    try {
        const todoDeleted= await TodoModel.findByIdAndUpdate(
            todoId,
            {isDeleted:true}
        )
        if(!todoDeleted){
            return res.status(404).json({message:"Todo is not Found"})
        }
        res.json({
            message:"Todo Deleted Sucessfully"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Server Error"})

    }
})



app.listen(3000,function(){
    console.log("Server is running on port 3000");
})