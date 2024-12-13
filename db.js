const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const ObjectId=mongoose.ObjectId;
const User=new Schema({
    email:{type:String,unique:true},
    password:String,
    name:String,
})
const Todo=new Schema({
    title:String,
    done:Boolean,
    isDeleted:Boolean,
    userId:{
        type:ObjectId,
        ref:'user',
        require: true
    }
})

const UserModel =mongoose.model("user",User)
const TodoModel=mongoose.model("todos",Todo)

module.exports={
    UserModel:UserModel,
    TodoModel:TodoModel
}