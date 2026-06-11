import { v4 as uuidv4 } from "uuid";
export function GenerateOtp (){
    const OTP  = uuidv4();
    return OTP;
}