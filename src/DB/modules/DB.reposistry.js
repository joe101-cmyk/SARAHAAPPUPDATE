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
export const create = async ({ model, data = [] }) => {
    return await model.create(data);
};

export const updateone = async ({
    model,
    filter = {},
    data = {},
    options = {},
}) => {
    return await model.updateOne(filter, data, options);
};





export const findoneandupdate = async ({
    model,
    filter = {},
    data = {},
    select = "",
    options = {},
}) => {

    const doc = model.findOneAndUpdate(
        filter,
        data,
        {
            new: true,
            ...options
        }
    );

    if (select.length) {
        doc.select(select);
    }

    if (options.populate) {
        doc.populate(options.populate);
    }

    if (options.lean) {
        doc.lean();
    }

    return await doc.exec();
};