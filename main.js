var config = require("./global.config");
var Worker = require("./worker");
var W_user = require("./weibo_user");

var workers = [],
    w_users = [], // weibo user list
    period_start = config.analysis_period.start,
    period_end = config.analysis_period.end;

for(var i = 0; i < config.weibo_account.length; i ++){
    var account = config.weibo_account[i];
    account.period_start = period_start;
    account.period_end = period_end;

    workers.push(new Worker(account));
}

for(var i = 0, j = 0; i < config.analysis_user.length && j < workers.length; i ++){
    var w_user = new W_user(config.analysis_user[i].alias, config.analysis_user[i].uid);
    workers[j].add_user(w_user);
    w_users.push(w_user);

    if(j == workers.length - 1){
        j = 0;
    }
    else{
        j ++;
    }
}

setTimeout(function(){
    for(var i = 0; i < workers.length; i ++){
        if(!workers[i].get_cookie){
            setTimeout(arguments.callee, 500);
        }
    }

    for(var i = 0; i < workers.length; i ++){
        workers[i].set_fans(workers);
        workers[i].update_weibo(workers)
            .then(function(worker){
                return worker.query_comment();
            });
        /*
        workers[i].query_comment()
            .then(function(worker){
                console.log(worker.list[1])
            });
            */
    }
},
500);

