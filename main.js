var config = require("./global.config");
var Worker = require("./worker");
var W_user = require("./weibo_user");
var utils = require("./utils");

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

    var tasks = [];
    for(var i = 0; i < workers.length; i ++){
        tasks[i] = workers[i].query_follow(workers);
    }

    Promise.all(tasks).then(function(){
        utils.calculate_fans(w_users);
        for(var i = 0; i < workers.length; i ++){
            tasks[i] = workers[i].query_weibo().then(function(worker){
                worker.remove_zombie_user();
                return worker.query_comment();
            }).then(function(worker){
                return worker.query_repost();
            });
        }

        Promise.all(tasks).then(function(){
            utils.calculate_UI(w_users);
            utils.sync_data_2_db(w_users);
        });
    });
},
500);

