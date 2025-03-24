class ErrorHandler extends Error {
    constructor(statusCode, message = "Something went wrong", errors=[],stack='') {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.err = err;
        this.stack = stack;
        this.success = false;
        this.errors = errors;
        
        if (stack) {
            this.stack = stack   
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
        
    }
}

export { ErrorHandler };