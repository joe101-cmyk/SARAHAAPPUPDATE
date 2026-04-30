import { hash,compare } from "bcrypt";
import *as argon2 from "argon2";
import { SALT } from "../../config/config.service.js";
import { hashEnum } from "../enum/security.enum.js";

export const generatehash = async ({plaintxt,salt=SALT,Algo=hashEnum.Bcrypt,})=>{
    let hasresult = "";
    switch(Algo){
        case hashEnum.Bcrypt:
        hasresult = await hash(plaintxt,salt);
        break;
        case hashEnum.Argon:
            hasresult = await argon2.hash(plaintxt);
            break;
    }
    return hasresult;




}



export const comparehash = async ({plaintxt,ciphertxt,Algo=hashEnum.Bcrypt,})=>{
    let match = false;
    switch(Algo){
        case hashEnum.Bcrypt:
        match = await compare(plaintxt,ciphertxt);
        break;
        case hashEnum.Argon:
            match = await argon2.verify(ciphertxt,plaintxt);
            break;
            default:
                match = await compare(ciphertxt,plaintxt);
                break;
    }
    return match;




}