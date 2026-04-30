export const  successResponse = ({res,statuscode = 200 ,message = "Done",data = {}})=>{
    return res.status(statuscode).json({message,data})
}