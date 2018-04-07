var https = require("https");
var querystring = require('querystring');

var get_request = function(opt){
    var request = arguments.callee;
    if(typeof opt.options == "undefined"){
        var options = {
            hostname: "weibo.cn",
            port: 443,
            path: opt.url,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Cookie": opt.cookie
            }
        };
    }
    else{
        var options = opt.options;
    }

    var req = https.request(options, function (res) {
        var data = "";
        if(res.statusCode != 200){
            console.log("status code: " + res.statusCode);
            setTimeout(function(){
                request(opt);
            },
            60000);
            return;
        }
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            data += chunk;
        });

        res.on("end", function() {
            if(opt.success){
                opt.success(data);
            }
        });
    });

    req.on("error", function (e) {
        console.log("problem with request: " + e.message);
        if(opt.fail){
            opt.fail(e);
        }
    });

    req.end();
}

var post_request = function(opt){
    var post_data = querystring.stringify(opt.contents),
        options = opt.options;

    options.headers['Content-Length'] = post_data.length;

    var req = https.request(options, function (res) {
        var data = "";
        res.setEncoding("utf8");
        res.on("data", function(chunk) {
            data += chunk;
        });

        res.on("end", function() {
            if(opt.success){
                opt.success(data);
            };
        });
    });

    req.on("error", function (e) {
        console.log("problem with request: " + e.message);
        if(opt.fail){
            opt.fail(e);
        }
    });

    req.write(post_data);
    req.end();
}

var post_and_get_cookie = function(opt){
    var post_data = querystring.stringify(opt.contents),
        options = opt.options;
    options.headers['Content-Length'] = post_data.length;

    var req = https.request(options, function (res) {
        if(opt.success){
            opt.success(res.headers['set-cookie'])
        }
    });

    req.on("error", function (e) {
        console.log("problem with request: " + e.message);
        if(opt.fail){
            opt.fail(e);
        }
    });

    req.write(post_data);
    req.end();
}

module.exports = {
    get_request: get_request,
    post_request: post_request,
    post_and_get_cookie: post_and_get_cookie
}