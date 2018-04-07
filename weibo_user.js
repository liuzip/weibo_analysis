var Weibo = function(opt){
    this.uid = opt.uid;
    this.timestamp = opt.timestamp;
    this.repost = [];
    this.comment = [];
    this.state = "w_init_comment";
    /********************************
    w_init_comment
    w_init_repost
    w_all_end
    ********************************/
}

var W_user = function(alias, uid){
    this.alias = alias;
    this.uid = uid;
    this.follow = [];
    this.fans = [];
    this.weibo = {};
    this.state = "u_initial"; 
    /********************************
    u_initial
    u_need_init_follow
    u_need_init_fans
    u_need_init_weibo
    u_need_init_comment
    u_need_init_repost
    u_need_calculate_effect
    u_all_end
    ********************************/
}


W_user.prototype.add_weibo = function(opt){
    var uid = opt.uid;
    if(typeof this.weibo[uid] == "undefined"){
        this.weibo[uid] = new Weibo(opt);
    }
}


module.exports = W_user;
