import mongoose, { VirtualType } from "mongoose";
import { gendernum, ProvideEnum, Roleenum } from "../../../utils/enum/user.enum.js";


const usersmodel= new mongoose.Schema({
    firstname:{
        type:String,
        required:[true,"Enter First name require"],
        minlength:2,
        maxlength:25,
    },
    lastname:{
        type:String,
        required:[true,"Enter Last name require"],
        minlength:2,
        maxlength:25,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:function(){
            return this.privoder ==ProvideEnum.system;
        },
    },
    DOB:Date,
    Phone:String,
    role:{
        type:String,
        enum:Object.values(Roleenum),
        default:Roleenum.user
    },
    gender:{
        type:String,
        enum:Object.values(gendernum),
        default:gendernum.Male,
    },


    privoder:{
    type:String,
    enum:Object.values(ProvideEnum),
    default:ProvideEnum.Google,    
    },
    confiememail:String,
    profilepublic:String,
    changeTimecredintals:Date,
}
,
{timestamps:true,toJSON:{virtual:true},toObject:{virtual:true}})





usersmodel.virtual("usermodel").set(function(value){
    const [firstname,lastname]= value.split(" ")||[];
    this.set({firstname,lastname})

}).get(function(){
    return `${this.firstname} ${this.lastname}`
})

export default mongoose.model("users",usersmodel)
