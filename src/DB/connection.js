import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";
    console.log("DB_URI:", DB_URI);
    const connect_DB = async()=>{
        
    try{
        mongoose.connection.on("connected",()=>{
            console.log("Connect_DB");
            
        })
        mongoose.connect(DB_URI,{
            serverSelectionTimeoutMS:500,
        });
    }
    catch(error){
        console.log("ERROR CONNECT DB",error);
        
    };
    
}

export default connect_DB;
