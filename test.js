const http_errors = require(".")

let i = 0;
const log = (err) => {
    i += 1;
    console.log(i, typeof (err));
    console.log(err.toString());
    console.log(`${err}`);
    console.log(JSON.stringify(err.valueOf()));
    console.log(JSON.stringify(err.responseData()));
    console.log(JSON.stringify(err.responseDataV2()));
    console.log("-----\n")
}

const test1 = () => {
    console.log("\nhttp_errors.apiError: ", typeof (http_errors.apiError))

    let e1 = http_errors.apiError();
    log(e1);

    let e2 = http_errors.apiError(this);
    log(e2);

    let e3 = http_errors.apiError(40005);
    log(e3);

    let e4 = http_errors.apiError(401);
    log(e4);

    let e5 = http_errors.apiError("Test HTTP ERRORS");
    log(e5);

    let e6 = http_errors.apiError(e4);
    log(e6);

    try {
        let e7 = http_errors.abort(401)
    } catch (e) {
        log(e);
    }
}

const test2 = () => {
    console.log("\nhttp_errors.ApiError.new: ", typeof (http_errors.ApiError.new))
    let e1 = http_errors.ApiError.new();
    log(e1);

    let e2 = http_errors.ApiError.new(this);
    log(e2);

    let e3 = http_errors.ApiError.new(40005);
    log(e3);

    let e4 = http_errors.ApiError.new(401);
    log(e4);

    let e5 = http_errors.ApiError.new("Test HTTP ERRORS");
    log(e5);

    let e6 = http_errors.ApiError.new(e4);
    log(e6);

    try {
        let e7 = http_errors.abort(401)
    } catch (e) {
        log(e);
    }


    console.log(typeof (http_errors.apiError))
}


const test3 = () => {
    console.log("\nnew http_errors.ApiError: ", typeof (http_errors.ApiError))

    let e1 = new http_errors.ApiError();
    log(e1);

    let e2 = new http_errors.ApiError(this);
    log(e2);

    let e3 = new http_errors.ApiError(40005);
    log(e3);

    let e4 = new http_errors.ApiError(401);
    log(e4);

    let e5 = new http_errors.ApiError("Test HTTP ERRORS");
    log(e5);

    let e6 = new http_errors.ApiError(e4);
    log(e6);

    try {
        let e7 = http_errors.abort(401)
    } catch (e) {
        log(e);
    }
}


const testSample = () => {
    let e7 = http_errors.apiError(40100);
    let e8 = http_errors.apiError(401);
    let e9 = http_errors.apiError({errno: 40102, message: "require re-login"});
    let e10 = http_errors.apiError(e9);

    console.log(e9 === e10);

    // json response data
    console.log(e7.responseData());
    console.log(e8.responseDataV2());
}

test1()
test2()
test3()
testSample()
