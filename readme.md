
# js-http-errors

Best Practices for HTTP API Error Handling

* support richer error message with custom 5-digit ErrorNumber
* auto detect standard HTTP Status code
* auto generate random request_id
* JSON-API Response: 
    
    responseData：`{ <int:code>, <str:error> ,<str:request_id> }`
    
    responseDataV2: ` { <obj:error> , <str:request_id> }`

---

## installation
require `nodejs > v7.6.0` for class extends support
```shell script
npm install js-http-errors
```

## parameters

- @status  :int:alias=`status_code`: HTTP返回状态码，默认值400 
- @message :str:alias=`error_msg`: 错误信息
- @errno   :int:alias=`code`:  错误码, 默认值为 40000
    - 建议使用 5 位数，其中前 3 位应设计等于 http status code 返回状态码
- @trackError:object: 原始错误Error，默认值为 null       
---

## usage sample

```javascript
const http_errors = require("js-http-errors");

// 0. support init Error by `new ApiError` || `ApiError.new` || `apiError` 
let e1 = new http_errors.ApiError(40100);
let e2 = new http_errors.ApiError(401);
let e3 = new http_errors.ApiError({errno:40102, message:"require re-login"});

// or 
let e4 = http_errors.ApiError.new(40100);
let e5 = http_errors.ApiError.new(401);
let e6 = http_errors.ApiError.new({errno:40102, message:"require re-login"});

// or
let e7 = http_errors.apiError(40100);
let e8 = http_errors.apiError(401);


// 1. json response data with random request_id
console.log(e7.responseData());
/*
{
  code: 40100,
  error: 'User Require Login',
  request_id: 'X6822759T8242827'
}
*/
console.log(e8.responseDataV2());
/*
{
  request_id: 'X6822759T5B7U3TR',
  error: {
    name: 'ApiError',
    errno: 40100,
    message: 'Unauthorized',
    trackError: null
  }
}
*/


// 2. suggest to use `apiError` or `apiError.new`, avoid to renew ApiError 
let e9 = http_errors.apiError({errno:40102, message:"require re-login"});
let e10 = http_errors.apiError(e9);     // e9 === e10



// 4. throw Error immediately by `abort`
http_errors.abort(401);                 // equal to: `http_errors.abort(40100);`

let err = new Error("Local Error")
http_errors.abort(403, err);            // equal to: `http_errors.abort({status:403, trackError:err});`         
 
```
