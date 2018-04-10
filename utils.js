var calculate_UI = function(user_list){
    if(typeof user_list != "object" ||
        typeof user_list.length == "undefined"){
        return;
    }

    // TO DO
    for(var i = 0; i < user_list.length; i ++){
        
    }
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