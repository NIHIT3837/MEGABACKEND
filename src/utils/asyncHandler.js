
// METHOD 2 WRAPPPER BY PROMISE INSTEAD OF TRY-CATCH

const asyncHandler= (requestHandler)=>{

    return (req, res, next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch( (error) => next(error))
    }

}

export {asyncHandler}









// METHOD 1 BY TRY-CATCH
/*
const asyncHandler=(fun)= async (req,res,next)=>{

    try {
        
    } catch (error) {

        res.status(error.code || 500 ).json(
            {
                success:false,
                message:error.message
            }
        )
        
    }

} */