exports.validation =(schema)=>{
    return (req,res,next)=>{
        let validData = schema.validate({...req.body},{abortEarly:false})
        if (validData.error) {
            return res.status(400).json({ error: validData.error.details });
            } else {
                req.validatedBody = validData.value;
                next();
            };
    }
}