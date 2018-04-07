var https = require('https');
var querystring = require('querystring');
 
var contents = querystring.stringify({
    username: "liuzip@qq.com",
    password: "lzhzip19890308",
    savestate: 1,
    ec: 0,
    entry: "mweibo",
    r: "http://m.weibo.cn/",
    pagerefer: "",
    wentry: "",
    loginfrom: "",
    client_id: "",
    code: "",
    qq: "",
    mainpageflag: 1,
    hff: "",
    hfp: ""
});
 
var options = {
    host:'passport.weibo.cn',
    path:'/sso/login',
    method:'POST',
    headers:{
        'Content-Type':'application/x-www-form-urlencoded',
        'Content-Length': contents.length,
        'Referer': "https://passport.weibo.cn/signin/login?entry=mweibo&res=wel&r=http%3A%2F%2Fm.weibo.cn%2F",
        'User-Agent': "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36"
    }
}
 
var req = https.request(options, function(res){
    console.log(res.headers['set-cookie'])

    res.setEncoding('utf8');
    res.on('data',function(data){
        console.log("data:",data);   //一段html代码
    });
});
 
req.write(contents);
req.end;