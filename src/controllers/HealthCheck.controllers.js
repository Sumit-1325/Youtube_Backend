import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
const healthCheck = asyncHandler(async (req, res, next) => {
    return res
        .status(200)
        .json(new ApiResponse(200, "success", { message: "Health Check Passed" }));

})

export { healthCheck }