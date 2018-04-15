var mysql = require('mysql');
var config = require("./global.config");
var connection = mysql.createConnection({
    host: "localhost",
    user: config.db_account.username,
    password: config.db_account.password,
    database: config.db_account.database
});
 
connection.connect();
 
var sync_data_2_db = function(user_list){
    if(typeof user_list != "object" ||
        typeof user_list.length == "undefined"){
        return;
    }

    var period_index = 0;

    (new Promise(function(resolve, reject){
        var sql = "insert into weibo_period (`period_start`, ` period_end`) values(" +
            config.analysis_period.start + ", " +
            config.analysis_period.end + ")";
        connection.query(sql, function (error, results, fields) {
            resolve();
        });
    })).then(function(){
        return new Promise(function(resolve, reject){
            var sql = "select max(`period_index`) as index from weibo_period;";
            connection.query(sql, function (error, results, fields) {
                period_index = results[0].index;
                resolve();
            });
        })
    }).then(function(){
        return new Promise(function(resolve, reject){
            var sql = "insert into weibo_user_influence (`user_uid`, `period_index`) values";

            for(var i = 0; i < user_list.length; i ++){
                sql += " ('" +
                    user_list[i].uid + "', " + period_index + "),";
            }

            if(sql.charAt(sql.length - 1) == ","){
                sql = sql.substring(0, sql.length - 1);
            }

            connection.query(sql, function (error, results, fields) {
                resolve();
            });
        })
    });
}

var calculate_UI = function(user_list){
    if(typeof user_list != "object" ||
        typeof user_list.length == "undefined"){
        return;
    }

    Array.prototype.count = function(val){
        return this.filter(function(ele){
            return ele == val;
        }).length;
    }

    Array.prototype.sum = function(){
        var sum = 0;
        this.every(function(ele){
            sum += ele;
            return true;
        })
        return sum;
    }

    var iterative_UI = function(list, epoch){
        if(epoch == 100){
            return;
        }

        for(var i = 0; i < list.length; i ++){
            list[i].tmp_UI = 0;
            for(var j = 0; j < list.length; j ++){
                list[i].tmp_UI += list[i].link_val[j] * list[j].UI;
            }
        }

        for(var i = 0; i < list.length; i ++){
            list[i].UI = list[i].tmp_UI;
        }

        arguments.calle(list, (++ epoch));
    }

    for(var i = 0; i < user_list.length; i ++){
        user_list[i].link_val = [];
        user_list[i].comment_list = [];
        user_list[i].repost_list = [];

        for(var w in user_list[i].weibo){
            var weibo = user_list[i].weibo[w];

            user_list[i].comment_list = user_list[i].comment_list.concat(weibo.comment);
            user_list[i].repost_list = user_list[i].repost_list.concat(weibo.repost);
        }

        for(var j = 0; j < user_list.length; j ++){
            var repost_count = user_list[i].repost_list.count(user_list[j].uid),
                comment_count = user_list[i].comment_list.count(user_list[j].uid);
            user_list[i].link_val[j] = 0.3 * repost_count + 0.7 * comment;
        }

        var total_link_val = user_list[i].link_val.sum();
        for(var j = 0; j < user_list.length; j ++){
            user_list[i].link_val[j] = user_list[i].link_val[j] / total_link_val;
        }

        user_list[i].UI = 100;
        user_list[i].tmp_UI = 0;
    }

    iterative_UI(user_list, 1);
}

var calculate_fans = function(user_list){
    if(typeof user_list != "object" ||
        typeof user_list.length == "undefined"){
        return;
    }

    for(var i = 0; i < user_list.length; i ++){
        for(var j = 0; j < user_list[i].follow.length; j ++){
            for(var k = 0; k < user_list.length; k ++){
                if(user_list[k].uid == user_list[i].follow[j]){
                    user_list[k].fans.push(user_list[i].uid);
                    break;
                }
            }
        }
    }
}

module.exports = {
    calculate_fans: calculate_fans,
    calculate_UI: calculate_UI
}