/*
* Best Practices for HTTP API Error Handling
* support richer error message with custom 5-digit ErrorNumber,
* and auto detect standard HTTP Status code
* JSON API Response:
    @message  :str: message of ApiError Response
    @errno    :int: ErrorNumber, default is 40000,
              ; suggest to use 5-digit number, The first three are equal to http status code
              ; 建议使用 5 位数，其中前 3 位等于 http status code 返回状态码，默认值为 40000
    @status   :int: http status code of ApiError Response, default is 400 while errno is unset
              ; http返回状态码，当 errno 无设置时，默认使用 400

*/

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

// you may update the defaultErrnoMessages to customize errno messages,
// note that the first 3 digits of errno should equal to http_status
const defaultErrnoMessages = {
    40000: 'Unknown Error',
    40005: 'Invalid Http Request',
    40099: 'Mysql Execute Error',
    40100: 'User Require Login',
    40300: 'User Forbidden/Unauthorized',
    40400: 'Source Not Found',
    40900: 'SqlError: You should not insert a duplicated item to database',
};

// you may update the defaultOptions to customize ApiError
const defaultOptions = {
    errno: 40000,
    status: 400,                // http status code
    message: 'UnknownError',
    request_id_length: 16,
};

const randomString = (length = 6) => {
    let s = Math.random().toString(36).substr(2);
    while (s.length < length) {
        s += Math.random().toString(36).substr(2);
    }
    return s.substr(0, length);
};

const genRequestId = (length = 16) => {
    let ct = new Date();
    let s = `X${ct.getMonth()}${ct.getDate()}${ct.getHours()}${ct.getMinutes()}${ct.getSeconds()}T`;
    let rnd = randomString(length - s.length);
    return `${s}${rnd.toUpperCase()}`;
};

class ApiError extends Error {
    // options: <int> errno || <str> message || <obj> options || <Error> error
    constructor(options) {
        super();
        const opts = this.constructor.check_options(options);
        // compat alias attributes
        this.name = opts.name || this.constructor.name;
        this.errno = opts.errno || opts.code || defaultOptions.errno;
        this.status = opts.status || opts.status_code || defaultOptions.status;
        this.message = opts.message || opts.error_msg || defaultOptions.message;
        this.trackError = opts.trackError || null;
        this.request_id = opts.request_id || genRequestId(defaultOptions.request_id_length);
    };

    static check_options(options) {
        let opts;
        const tp = typeof (options);
        switch (tp) {
            case 'number':
                let message = HTTP_STATUS_CODES[options];
                if (message) {
                    let errno = options * 100;
                    opts = {status: options, message, errno};
                } else {
                    let status = String(options).slice(0, 3);
                    message = defaultErrnoMessages[options] || HTTP_STATUS_CODES[status];
                    opts = {errno: options, message, status};
                }
                break;
            case 'string':
                opts = {message: options};
                break;
            case 'object':
                opts = Object.assign({}, options);
                if (options instanceof Error && !(options instanceof ApiError)) {
                    opts.trackError = options;
                }
                break;
            default:
                console.log("Unknown ApiError:", options)
                opts = Object.assign({}, options);
                opts = {trackError: options};
        }
        return opts;
    };

    static new(options) {
        if (options instanceof ApiError) {
            return options;
        } else {
            return new ApiError(options);
        }
    };

    toString() {
        let detail = this.trackError ? `\n${this.trackError}` : "";
        return `[${this.errno}] ${this.name}: ${this.message} - ${this.status} - ${this.request_id} ${detail}`;
    };

    valueOf() {
        const {status, errno, message, trackError, name, request_id} = this;
        return {status, errno, message, trackError, name, request_id};
    };

    responseData() {
        // { <int:code>, <str:error> , <str:request_id> }
        return {
            code: this.errno,
            error: this.message,
            request_id: this.request_id,
        };
    };

    responseDataV2() {
        // { <obj:error> , <str:request_id> }
        return {
            request_id: this.request_id,
            error: {
                name: this.name,
                errno: this.errno,
                message: this.message,
                trackError: this.trackError,
            }
        };
    };
}

const abort = (errnoOrOptions, trackError) => {
    // trackError is not in responseData
    // `abort({errno:40000, trackError:new Error(...)}) ` IS EQUAL TO `abort(400, new Error())`;
    const err = ApiError.new(errnoOrOptions);
    err.trackError = trackError instanceof Error ? trackError : err.trackError;
    throw err;
};

module.exports = {
    HTTP_STATUS_CODES: HTTP_STATUS_CODES,
    defaultOptions: defaultOptions,
    defaultErrnoMessages: defaultErrnoMessages,
    ApiError: ApiError,
    apiError: ApiError.new,
    abort: abort,
    randomString: randomString,
    genRequestId: genRequestId,
};
