const cheerio = require('cheerio');

var get_content_uid = function(html){
    var $ = cheerio.load(html),
        uid = [],
        max_pages = 0;
    $("div[class=c]").each(function(index, elem){
        var id = $(elem).attr("id");

        if(typeof id == "string" && id.substr(0, 2) == "M_" && $(elem).find("span[class=cmt]").length == 0){
            var weibo_uid = id.split("_")[1];

            var timestamp = $(elem).find("span[class=ct]").text();
            uid.push({
                uid: weibo_uid,
                timestamp: timestamp.substr(0, 19)
            })
        }
    });

    max_pages = parseInt($("input[name=mp]").val());

    return {
        max: max_pages,
        uid: uid
    };
}

var get_follow_uid = function(html){
    var $ = cheerio.load(html),
        uid = [],
        max_pages = 0;
    $("table").each(function(index, elem){
        $(elem).find("a").each(function(index, elem){
            if($(elem).text() == "关注他" || $(elem).text() == "关注她"){
                uid.push($(elem).attr("href").split("uid=")[1].split("&")[0])
            }
        })
    });

    max_pages = parseInt($("input[name=mp]").val());

    return {
        max: max_pages,
        uid: uid
    };
}

var get_comment_uid = function(html){
    var $ = cheerio.load(html),
        uid = [],
        max_pages = 0;
    $("div[class=c]").each(function(index, elem){
        var id = $(elem).attr("id");

        if(typeof id == "string" && id.substr(0, 2) == "C_" && $(elem).find("span[class=ct]").length != 0){
            var weibo_uid = "";
            $(elem).find("a").each(function(index, elem){
                if($(elem).text() == "举报"){
                    weibo_uid = $(elem).attr("href").split("=")[2].split("&")[0];
                }
            });

            if(weibo_uid.length != 0){
                var timestamp = $(elem).find("span[class=ct]").text();
                uid.push({
                    uid: weibo_uid,
                    timestamp: timestamp.substr(0, 19)
                });
            }
        }
    });

    max_pages = parseInt($("input[name=mp]").val());

    return {
        max: max_pages,
        uid: uid
    };
}



module.exports = {
    get_content_uid: get_content_uid,
    get_follow_uid: get_follow_uid,
    get_comment_uid: get_comment_uid
}

