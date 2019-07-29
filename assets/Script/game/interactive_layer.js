cc.Class({
    extends: cc.Component,

    properties: {
        mask:cc.Node,
        lab_time:cc.Label
    },

     onLoad () {
         let self = this;
         this.mask.on('touchend', function () {
             cc.vv.audioMgr.playSFX('ui_open', 'mp3');
             if(self.isShowing) return;
             self.onClickView();
         });

         this.time_str = 0;
     },

    onOpenView: function (data) {
        this.isShowing = true;
        this.data = data;
        this.changePlayerView(data);
        if(0 != cc.gameControl.interactive_time){
            let now_date = parseInt(new Date().getTime());    // 当前时间戳;
            this.time_str = 30 - Math.floor((now_date - cc.gameControl.interactive_time) / 1000);
            cc.log(this.time_str);
            if(0 < this.time_str){
                this.lab_time.string = this.time_str;
                this.schedule(this.checkJoin, 1);
            }else{
                cc.gameControl.interactive_time = 0;
                this.time_str = 0;
                this.lab_time.string = this.time_str;
                this.unschedule(this.checkJoin);
            }
        }
        var bg = this.node.getChildByName('bg');
        bg.scale = 0;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
            cc.callFunc(function () {
                this.isShowing = false;
            }.bind(this))
        ));
    },

    onClickView: function () {
        this.isShowing = true;
        var bg = this.node.getChildByName('bg');
        bg.scale = 1;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.1, 0).easing(cc.easeBackIn()),
            cc.callFunc(function () {
                this.isShowing = false;
                this.unschedule(this.checkJoin);
                this.node.active = false;
            }.bind(this))
        ));
    },

    onDestroy: function () {
        cc.loader.setAutoReleaseRecursively('Prefab/login/interactive_layer', true);
    },

    /**
     * 玩家头像部分信息显示
     */
    changePlayerView:function(data){
        //console.log(data);
        var head_node = this.node.getChildByName("bg").getChildByName("mask").getChildByName("head");
        var name_node = this.node.getChildByName("bg").getChildByName("label_name").getComponent(cc.Label);
        var id_node =  this.node.getChildByName("bg").getChildByName("label_id").getComponent(cc.Label);
        var ip_node =  this.node.getChildByName("bg").getChildByName("label_ip").getComponent(cc.Label);
        var address_node =  this.node.getChildByName("bg").getChildByName("label_address").getComponent(cc.Label);
        let userName = cc.vv.Global.getNameStr(data.nickname);
        name_node.string = "昵称：" + userName;
        id_node.string = "ID：" + data.id;
        ip_node.string = "IP：" + data.ip;
        address_node.string = "地址：" + "未获取到该玩家地址";
        if(null != data.address && "" != data.address){
            address_node.string = "地址：" + data.address;
        }
        let head = head_node.getComponent(cc.Sprite);
        let head_url = data.headimgurl;
        cc.loader.load(head_url, function (err, texture) {
            head.spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'btn_0':
            case 'btn_1':
            case 'btn_2':
            case 'btn_3':
            case 'btn_4':
            case 'btn_5':
            {
                cc.log(cc.vv.userData.face_status);
                if(cc.vv.userData.face_status == 1){
                    if(0 < this.time_str){
                        cc.loadingControl.showMsg("互动表情还在冷却中，请稍后");
                    }else{
                        this.chat_type = 4;
                        var index = parseInt(type[type.length - 1]);
                        this.msg = index;
                        this.sendRequest();
                    }
                }else{
                    cc.loadingControl.showMsg("互动表情功能未开启");
                }
                this.onClickView();
                break;
            }
        }
    },

    sendRequest: function () {
        var data = {
            'mid':cc.vv.userData.mid,
            'room_id':cc.vv.Global.room_id,
            'type':this.chat_type,
            'msg':this.msg,
            'toMid':this.data.id
        };
        if(this.data.id == cc.vv.userData.mid){
            cc.loadingControl.showMsg("无法与自己互动");
            return;
        }
        cc.vv.WebSocket.sendWS('RoomController','xiaoxi',data);
        cc.gameControl.interactive_time = parseInt(new Date().getTime());    // 当前时间戳;
        this.time_str = 30;
        this.lab_time.string = this.time_str;
        this.schedule(this.checkJoin, 1);
    },

    /**
     * 互动表情只能30秒发一次
     */
    checkJoin: function () {
        this.time_str -= 1;
        this.lab_time.string = this.time_str;

        if(0 == this.time_str){
            cc.gameControl.interactive_time = 0;
            this.unschedule(this.checkJoin);
        }
    }
    // update (dt) {},
});
