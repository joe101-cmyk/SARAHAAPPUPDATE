export const ErrorResponse = ({message = "Error",StatusCode = 400,extra = undefined})=>{
    const error = new Error(typeof message === "string"?message:message?.message||"Unknow Error");
    error.StatusCode = StatusCode;
    error.extra = extra;

    throw error;

}

export const badrequest = ({message = "bad Request Exeption",extra = undefined})=>{
    return ErrorResponse({message,StatusCode:400,extra})
}

export const NotFoundException = ({message = "Not Found",extra = undefined})=>{
    return ErrorResponse({message,StatusCode:409,extra})
}


export const confilectexpetion = ({message = "Confilect Exptione",extra = undefined})=>{
    return ErrorResponse({message,StatusCode:409,extra})
}

export const globelmiddlewarehandelar =(error,req,res,next)=>{
    const status = error.StatusCode??500;
    
    return res.status(status).json({message:error.message,stack:error.stack,status});
}