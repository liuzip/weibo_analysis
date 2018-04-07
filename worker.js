var http = require("./http_handler");
var parser = require("./parser");
var fs = require("fs")

Date.prototype.set_weibo_date = function(date){
    var split = date.split(""),
        year = parseInt(split[0] + split[1] + split[2] + split[3]),
        month = parseInt(split[4] + split[5]) - 1,
        date = parseInt(split[6] + split[7]);

    this.setYear(year);
    this.setMonth(month);
    this.setDate(date);

    return this;
}

var Worker = function(opt){
    this.username = opt.username;
    this.password = opt.password;
    this.start = opt.period_start;
    this.end = opt.period_end;
    this.cookie = "";
    this.get_cookie = false;
    this.list = [];

    this.threshold = Math.floor(((new Date()).set_weibo_date(this.end).getTime() - 
            (new Date())set_weibo_date(this.start).getTime()) / 2 / 3600 / 24);

    this.query_cookie();
};

Worker.prototype.add_user = function(user){
    user.state = "n_init_weibo";
    this.list.push(user);
}


Worker.prototype.set_fans = function(workers){
    for(var i = 0; i < this.list.length; i ++){
        for(var j = 0; j < workers.length; j ++){
            for(var k = 0; k < workers[j].list.length; k ++){
                this.list[i].fans.push(workers[j].list[k].uid);
                this.list[i].state = "n_init_weibo";
            }
        }
    }
}

Worker.prototype.update_weibo = function(){
    var _self = this;

    return new Promise(function(resolve, reject){
        fs.readFile("weibo.list.bak", {encoding:'utf-8'}, function(err, bytesRead){
            _self.list = JSON.parse(bytesRead);
            resolve(_self);
        });
    })
}

Worker.prototype.query_cookie = function(){
    var _self = this;

    http.post_and_get_cookie({
        options: {
            host:'passport.weibo.cn',
            path:'/sso/login',
            method:'POST',
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
                'Referer': "https://passport.weibo.cn/signin/login?entry=mweibo&res=wel&r=http%3A%2F%2Fm.weibo.cn%2F",
                'User-Agent': "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36"
            }
        },
        contents: {
            username: this.username,
            password: this.password,
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
        },
        success: function(cookies){
            for(var i = 0; i < cookies.length; i ++){
                var cookie = cookies[i].split("; ");
                if(cookie.length > 1){
                    _self.cookie += cookie[0] + "; ";
                }
            }

            _self.get_cookie = true;
        }
    })
}


/*************************************************
param:  opt ==> object, must
            {
                user: objct, must ==> weibo user object
                add_weibo: function, must ==> the function of weibo user add weibo
                start: string, must ==> "yyyymmdd"
                end: string, must ==> "yyyymmdd"
            }
        cookie ==> string, optional
        page ==> number, optional
        max ==> number, optional
*************************************************/
Worker.prototype.query_weibo = function(){
    var start = this.start,
        end = this.end,
        page = 1,
        cookie = this.cookie,
        list = this.list,
        max = undefined,
        user_uid = undefined,
        _self = this,
        user = undefined;

    for(var i = 0; i < list.length; i ++){
        if(list[i].state == "n_init_weibo"){
            user = list[i];
            user_uid = user.uid;
            break;
        }
    }

    if(user)
        console.log(user.alias)
    else
        console.log("undefined")

    return new Promise(function(resolve, reject){
        if((typeof max == "undefined" || max >= page) && typeof user != "undefined"){
            // https://weibo.cn/{用户uid}/profile?starttime=yyyymmdd&endtime= yyyymmdd&advancedfilter=1&page=1
            var url = "/" + user_uid + "/profile?starttime=" + start + 
                "&endtime=" + end + "&advancedfilter=1&page=" + page,
                func = arguments.callee;

            http.get_request({
                url: url,
                cookie: cookie,
                success: function(html){
                    var parsed = parser.get_content_uid(html);
                    max = parsed.max;

                    console.log(page, max)

                    for(var i = 0; i < parsed.uid.length; i ++){
                        user.add_weibo(parsed.uid[i]);
                    }

                    fs.writeFile("weibo.list", JSON.stringify(_self.list), function(err){
                    });

                    setTimeout(function(){
                        page ++;
                        func(resolve, reject);
                    },
                    10000);
                }
            })
        }
        else{
            if(user){
                user.state = "n_init_follow";
                setTimeout(function(){
                    _self.query_weibo().then(function(){
                        resolve(_self);
                    });
                },
                10000);
            }
            else{
                resolve(_self);
            }
        }
    });
}


Worker.prototype.query_follow = function(){
    var _self = this,
        user = undefined,
        page = 1,
        cookie = this.cookie,
        list = this.list,
        max = undefined,
        user_uid = undefined;

    for(var i = 0; i < this.list.length; i ++){
        if(this.list[i].state == "n_init_follow"){
            user = this.list[i];
            user_uid = user.uid;
            break;
        }
    }

    if(user)
        console.log(user.alias)
    else
        console.log("undefined")

    return new Promise(function(resolve, reject){
        if((typeof max == "undefined" || max >= page) && typeof user != "undefined"){
            // https://weibo.cn/{用户uid}/follow?page=1
            var url = "/" + user_uid + "/follow?page=" + page,
                func = arguments.callee;

            http.get_request({
                url: url,
                cookie: cookie,
                success: function(html){
                    var parsed = parser.get_follow_uid(html);
                    max = parsed.max;

                    console.log(page, max);

                    for(var i = 0; i < parsed.uid.length; i ++){
                        user.follow.push(parsed.uid[i])
                    }

                    setTimeout(function(){
                        page ++;
                        func(resolve, reject);
                    },
                    10000);
                }
            })
        }
        else{
            if(user){
                user.state = "n_init_weibo";
                setTimeout(function(){
                    _self.query_follow().then(function(){
                        resolve(_self);
                    });
                },
                10000);
            }
            else{
                resolve(_self);
            }
        }
    });
}

Worker.prototype.remove_zombie_user = function(){
    this.list = this.list.filter(function(user){
        var num = 0;
        for(var weibo in user.weibo){
            if(user.weibo.hasOwnPorperty(weibo)){
                num ++;
            }
        }

        return num > this.threshold;
    });
}

Worker.prototype.query_comment = function(){
    var start = (new Date()).set_weibo_date(this.start).getTime(),
        end = (new Date()).set_weibo_date(this.end).getTime(),
        _self = this,
        weibo = undefined,
        user = undefined,
        page = 1,
        cookie = this.cookie,
        list = this.list,
        max = undefined,
        fans = [];

    for(var i = 0; i < this.list.length; i ++){
        if(this.list[i].state == "n_init_comment"){
            user = this.list[i];
            for(var j in user.weibo){
                if(user.weibo[j].state == "n_init_comment"){
                    weibo = user.weibo[j];
                    fans = user.fans;
                    break;
                }
            }

            if(typeof weibo != "undefined"){
                break;
            }
            else{
                this.list[i].state == "n_init_repost"
            }
        }
    }

    return new Promise(function(resolve, reject){
        if((typeof max == "undefined" || max >= page) && typeof weibo != "undefined"){
            // https://weibo.cn/{用户uid}/follow?page=1
            var url = "/comment/" + weibo.uid + "?page=" + page,
                func = arguments.callee;

            http.get_request({
                url: url,
                cookie: cookie,
                success: function(html){
                    var parsed = parser.get_comment_uid(html);
                    max = parsed.max;

                    for(var i = 0; i < parsed.uid.length; i ++){
                        var uid = parsed.uid[i].uid,
                            timestamp = new Date(parsed.uid[i].timestamp).getTime();
                        if(fans.indexOf(uid) != -1 &&
                            timestamp <= end &&
                            timestamp >= start){
                            weibo.comment.push(parsed.uid[i]);
                        }
                    }

                    setTimeout(function(){
                        page ++;
                        func(resolve, reject);
                    },
                    10000);
                }
            })
        }
        else{
            if(weibo){
                weibo.state = "n_init_repost";
                setTimeout(function(){
                    _self.query_comment().then(function(){
                        resolve(_self);
                    });
                },
                10000);
            }
            else{
                resolve(_self);
            }
        }
    });
};


module.exports = Worker;


