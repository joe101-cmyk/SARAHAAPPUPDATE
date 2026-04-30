export const findone = async({model,select="",filter={},options ={}})=>{
    const doc = model.findOne(filter);

    if(select.length){
        doc.select(select);
    }

    if (options.populate){
        doc.populate(options.populate);
    }

    if(options.lean){
        doc.lean();
    }

    return await doc.exec();
}



export const findbyid = async({model,select="",id,options ={}})=>{
    const doc = model.findById(id);

    if(select.length){
        doc.select(select);
    }

    if (options.populate){
        doc.populate(options.populate);
    }

    if(options.lean){
        doc.lean();
    }

    return await doc.exec();
}