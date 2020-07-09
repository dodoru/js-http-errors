
# js-http-errors

Best Practices for HTTP API Error Handling

0. be easy and flexible to humans
1. support richer error codes with custom 5-digit `errno`
2. auto detect standard `HTTP_STATUS_CODES` with `status`
3. auto generate random `request_id`
4. JSON-API Response: 
  - responseData：`{ <int:code>, <str:error> ,<str:request_id> }`
  - responseDataV2: `{ <obj:error> , <str:request_id> }`
---

## installation
require `nodejs > v7.6.0` for class extends support
```shell script
npm install js-http-errors
```

## parameters (attributes of `ApiError`) 

- @status  :int:alias=`status_code`:
    - HTTP STATUS CODE, default = `400` 
    - HTTP返回状态码，默认值400
     
- @message :str:alias=`error_msg`:
    - error message content
    - 错误文本信息
    
- @errno   :int:alias=`code`:  
    - error code, default=`40000`
    - suggest to use 5-digit number with its first 3-digit represent HTTP STATUS CODE  
    - 错误码, 默认值为 40000, 建议使用 5 位数，其中前 3 位应设计等于 http status code 返回状态码
    
- @trackError:object:
    - Original Error Tracked by ApiError, default is `null` 
    - 原始错误Error，默认值为 null    
       
---

## usage

### 1. ApiError

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


// 2. suggest to use `apiError` or `apiError.new`, avoid to renew ApiError duplicated 
let e9 = http_errors.apiError({errno:40102, message:"require re-login"});
let e10 = http_errors.apiError(e9);     
// e9 === e10 , while e9 !== new http_errors.ApiError(e9)


// 3. throw Error immediately by `abort`
http_errors.abort(401);             // detect message from HTTP_STATUS_CODES                  
http_errors.abort(40100);           // detect message from defaultErrnoMessages

let err = new Error("Local Error")
http_errors.abort(403, err);            
// equal to: `http_errors.abort({status:403, trackError:err});`         
 
```

### 2. HTTP_STATUS_CODES

- Auto detect error message by `status` with `HTTP_STATUS_CODES`

```javascript
// standard http status codes and messages
const HTTP_STATUS_CODES = {
    // 1xx Informational response
    "100": "Continue",
    "101": "Switching Protocols",
    "102": "Processing",
    "103": "Early Hints",           // RFC 8297

    // 2xx Success
    "200": "Ok",
    "201": "Created",
    "202": "Accepted",
    "203": "Non Authoritative Information",
    "204": "No Content",
    "205": "Reset Content",
    "206": "Partial Content",
    "207": "Multi Status",
    "208": "Already Reported",      // RFC 5842 WebDAV
    "218": "This Is Fine",          // not standard, Apache Web Server
    "226": "Im Used",               // RFC 3229

    // 3xx Redirection
    "300": "Multiple Choices",
    "301": "Moved Permanently",
    "302": "Moved Temporarily",
    "303": "See Other",
    "304": "Not Modified",
    "305": "Use Proxy",
    "307": "Temporary Redirect",
    "308": "Permanent Redirect",

    // 4xx Client errors
    "400": "Bad Request",
    "401": "Unauthorized",
    "402": "Payment Required",
    "403": "Forbidden",
    "404": "Not Found",
    "405": "Method Not Allowed",
    "406": "Not Acceptable",
    "407": "Proxy Authentication Required",
    "408": "Request Timeout",
    "409": "Conflict",
    "410": "Gone",
    "411": "Length Required",
    "412": "Precondition Failed",
    "413": "Request Too Long",
    "414": "Request Uri Too Long",
    "415": "Unsupported Media Type",
    "416": "Requested Range Not Satisfiable",
    "417": "Expectation Failed",
    "418": "Im A Teapot",
    "419": "Insufficient Space On Resource",
    "420": "Method Failure",
    "421": "Misdirected request",
    "422": "Unprocessable Entity",                  // RFC 4918 WebDAV
    "423": "Locked",                                // RFC 4918 WebDAV
    "424": "Failed Dependency",                     // RFC 4918 WebDAV
    "425": "Too Early",                             // RFC 8470
    "426": "Upgrade Required",                      // RFC 2817: require client use TLS/1.0
    "428": "Precondition Required",
    "429": "Too Many Requests",
    "431": "Request Header Fields Too Large",
    "449": "Retry With",                            // RFC 2616 WebDAV: Microsoft
    "451": "Unavailable For Legal Reasons",         // RFC 7725: used in Exchange ActiveSync

    // 5xx Server errors
    "500": "Internal Server Error",
    "501": "Not Implemented",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Timeout",
    "505": "Http Version Not Supported",
    "506": "Variant Also Negotiates",               // RFC 2295
    "507": "Insufficient Storage",                  // RFC 4918 WebDAV
    "508": "Loop Detected",                         // RFC 5842 WebDAV
    "509": "Bandwidth Limit Exceeded",              // not standard, but common
    "510": "Not Extended",                          // RFC 2774
    "511": "Network Authentication Required",
    "600": "Unparseable Response Headers",           // not standard, used infrequently in China
};

```

- Want to customize the `HTTP_STATUS_CODES` ?

```javascript
const HTTP_STATUS_CODES = require("js-http-errors").HTTP_STATUS_CODES;
HTTP_STATUS_CODES[401] = "Login Required"
```

### 3. ErrnoMessages

- richer error codes and messages 

```javascript
const defaultErrnoMessages = {
    40000: 'Unknown Error',
    40005: 'Invalid Http Request',
    40099: 'Mysql Execute Error',
    40100: 'User Require Login',
    40300: 'User Forbidden/Unauthorized',
    40400: 'Source Not Found',
    40900: 'SqlError: You should not insert a duplicated item to database',
};
```

- you may update the defaultErrnoMessages to customize errno messages

```javascript
const defaultErrnoMessages = require("js-http-errors").defaultErrnoMessages;
defaultErrnoMessages[40041] = "Invalid Password"
```

- suggest to use 5-digit-number with its first 3-digit represent HTTP STATUS CODE

