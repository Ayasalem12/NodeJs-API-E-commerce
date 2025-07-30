class ApiFeatures{
    constructor(mogooseQuery, queryString){
        this.mogooseQuery = mogooseQuery;
        this.queryString = queryString;
    }
    filter(){
        const queryStringObj = {...this.queryString};
        const excludesFiels = ['page','sort','limit','fieldds'];
        excludesFiels.forEach((field) => delete queryStringObj[field]);
        // apply filteration using [qte,gt,lte,lt]
        let queryStr = JSON.stringify(queryStringObj);
        queryStr = queryStr.replace(/\b(qte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.mogooseQuery = this.mogooseQuery.find(JSON.parse(queryStr))
        return this;
    }

    sort(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.mogooseQuery = this.mogooseQuery.sort(sortBy);
        }else{
            this.mogooseQuery = this.mogooseQuery.sort('-createdAt');
        }
        return this;
    }
    limitFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.mogooseQuery = this.mogooseQuery.select(fields);
        }else{
            this.mogooseQuery = this.mogooseQuery.select('-__v');
        }
        return this;
    }
    search(){
        const keyword = this.queryString.keyword;
        if(keyword){
            let query = {};
            if(modelName === 'Products'){
                query.$or = [
                    {title:{$regex:keyword,$options:'i'}},
                    {description:{$regex:keyword,$options:'i'}},
                ]
            }else{
                query = {name:{$regex:keyword,$options:'i'}}
            }
            this.mogooseQuery = this.mogooseQuery.where(query);
            // this.mogooseQuery = this.mogooseQuery.find({ ...existingFilters, ...query });
        }
        return this;
    }
    paginate(countDocuments){
        const page = this.queryString.page *1 || 1;
        const limit = this.queryString.limit *1 || 10;
        const skip = (page-1)*limit;
        const endIndex = page * limit;

        //pagination results
        const pagination = {}
        pagination.currentpage = page;
        pagination.limit = limit;
        pagination.numberOfPages = Math.ceil(countDocuments/limit);

        //nextPage
        if(endIndex < countDocuments){
            pagination.nextPage = page + 1;
        }
        if(skip > 0){
            pagination.prevPage = page - 1;
        }
        this.mogooseQuery = this.mogooseQuery.skip(skip).limit(limit);
        this.paginationResult = pagination
        return this;
    }
}
module.exports = ApiFeatures;