
cc.Class({
    extends: cc.Component,
    properties: {
        title:cc.Label,
        time:cc.Label
    },

    ctor: function () {
        this.isShowing = false;
        this.broadcostTimes = 60;
    },

    onDestroy: function () {
        //cc.loader.setAutoReleaseRecursively('Prefab/game/vote_layer', true);
    },

    onOpenView: function (data) {
        cc.log(data);
        if(!cc.gameControl) return;
        this.schedule(this.doCountdownTime,1);
        this.isShowing = true;
        var bg = this.node;
        bg.scale = 0;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
            cc.callFunc(function () {
                this.isShowing = false;
            }.bind(this))
        ));
        var nickname = cc.gameControl.userInfo[data.mid].nickname;
        nickname = cc.vv.Global.getNameStr(nickname);
        this.title.string = "【" + nickname + "】申请立即开局(" + data.num + "人场)";

        console.log(cc.gameControl.player_id_arr);
        let j = 0;
        for(var i = 0; i < cc.gameControl.player_id_arr.length; i++){
            if(0 != cc.gameControl.player_id_arr[i]){
                //var user = this.node.getChildByName("user" + i);
                var user = cc.find("user_node/user" + j,this.node);
                user.active = true;
                let head = user.getChildByName("mask").getChildByName("head").getComponent(cc.Sprite);
                let head_url = cc.gameControl.userInfo[cc.gameControl.player_id_arr[i]].headimgurl;
                cc.loader.load(head_url, function (err, texture) {
                    head.spriteFrame = new cc.SpriteFrame(texture);
                });
                user.getChildByName("nickname").getComponent(cc.Label).string = cc.vv.Global.getNameStr(cc.gameControl.userInfo[cc.gameControl.player_id_arr[i]].nickname);
                if(data.ks_tp[cc.gameControl.player_id_arr[i]] != null){
                    if(data.ks_tp[cc.gameControl.player_id_arr[i]] == 1){
                        user.getChildByName("status").getComponent(cc.Label).string = "已同意";
                        user.getChildByName("status").color = cc.color(0,255,0);
                    }else{
                        user.getChildByName("status").getComponent(cc.Label).string = "已拒绝";
                        user.getChildByName("status").color = cc.color(255,0,0);
                    }
                }

                j++;
            }
        }
        if(data.ks_tp[cc.vv.userData.mid] != null){          //自己有操作了            操作按钮隐藏
            this.node.getChildByName("bg").getChildByName("btn_sure").active = false;
            this.node.getChildByName("bg").getChildByName("btn_refuse").active = false;
        }else{
            this.node.getChildByName("bg").getChildByName("btn_sure").active = true;
            this.node.getChildByName("bg").getChildByName("btn_refuse").active = true;
        }
    },

    onChangeView:function(data){
        console.log(cc.gameControl.player_id_arr);
        for(var i = 0; i < cc.gameControl.player_id_arr.length; i++){
            if(0 != cc.gameControl.player_id_arr[i]){
                //var user = this.node.getChildByName("user" + i);
                var user = cc.find("user_node/user" + i,this.node);
                user.active = true;
                let head = user.getChildByName("mask").getChildByName("head").getComponent(cc.Sprite);
                let head_url = cc.gameControl.userInfo[cc.gameControl.player_id_arr[i]].headimgurl;
                cc.loader.load(head_url, function (err, texture) {
                    head.spriteFrame = new cc.SpriteFrame(texture);
                });
                user.getChildByName("nickname").getComponent(cc.Label).string = cc.vv.Global.getNameStr(cc.gameControl.userInfo[cc.gameControl.player_id_arr[i]].nickname);
                if(data.ks_tp[cc.gameControl.player_id_arr[i]] != null){
                    if(data.ks_tp[cc.gameControl.player_id_arr[i]] == 1){
                        user.getChildByName("status").getComponent(cc.Label).string = "已同意";
                        user.getChildByName("status").color = cc.color(0,255,0);
                    }else{
                        user.getChildByName("status").getComponent(cc.Label).string = "已拒绝";
                        user.getChildByName("status").color = cc.color(255,0,0);
                    }
                }
            }
        }
        if(data.ks_tp[cc.vv.userData.mid] != null){          //自己有操作了            操作按钮隐藏
            this.node.getChildByName("bg").getChildByName("btn_sure").active = false;
            this.node.getChildByName("bg").getChildByName("btn_refuse").active = false;
        }else{
            this.node.getChildByName("bg").getChildByName("btn_sure").active = true;
            this.node.getChildByName("bg").getChildByName("btn_refuse").active = true;
        }
    },

    vote:function(enent,type){
        cc.vv.WebSocket.sendWS('GameController', 'fast', {
            mid: cc.vv.userData.mid,
            room_id: cc.vv.Global.room_id,
            status: type
        });
    },

    //倒计时
    doCountdownTime:function(){
        //每秒更新显示信息
        if (this.broadcostTimes > 0 ) {
            this.broadcostTimes -= 1;
            this.time.string = "倒计时: " + this.broadcostTimes;
            this.countDownShow(this.broadcostTimes);
        }
    },

    countDownShow:function(temp){
        if(temp <= 0){
            //倒计时结束
            this.unschedule(this.doCountdownTime);
            //执行其他操作
        }
    },

    changeTime:function(time){
        this.broadcostTimes -= time;
        this.time.string = "倒计时: " + this.broadcostTimes;
    },

    closeVote:function(){
        this.unschedule(this.doCountdownTime);
        this.broadcostTimes = 300;
        this.time.string = "倒计时: " + this.broadcostTimes;
    }
});
