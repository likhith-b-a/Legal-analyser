import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const getSummary = asyncHandler(async (req, res)=>{
    const filePath = req.file?.path;

    if(!filePath){
      throw new ApiError(400,"Document Missing");
    }

    return res.status(200).json(new ApiResponse(200,filePath,"success"));

})

export {getSummary}