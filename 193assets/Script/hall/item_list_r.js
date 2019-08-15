cc.Class({
    extends: cc.Component,

    properties: {
        head:cc.SpriteFrame
    },

    onLoad: function () {

    },

    onOpenView: function (data) {
        cc.log(data);
        this.showBtn();
        this.roomInfo = data.roomInfo;
        this.userInfo = data.userInfo;

        let label_0 = cc.find("top/label_roomid",this.node).getComponent(cc.Label);
        let label_1 = cc.find("top/label_ju",this.node).getComponent(cc.Label);
        let label_2 = cc.find("wenzi_bg/label_wanfa",this.node).getComponent(cc.Label);
        label_0.string = "房间号: " + data.roomInfo.guize.room_id;
        label_1.string = "局数: " + data.roomInfo.guize.jushu;
        label_2.string = "柳州麻将 " + (data.roomInfo.guize.menqing == 1 ? "门清 " : "") +
            (data.roomInfo.guize.fangfei == 1 ? "房费均摊 " : data.roomInfo.guize.fangfei == 2 ? "房主支付 ":"俱乐部支付 ") +
            (data.roomInfo.guize.yu_num == 1 ? "爆炸鱼 " : "钓" + data.roomInfo.guize.yu_num + "条鱼 ") +
            (data.roomInfo.guize.fengding == 0 ? "无限番 " : "自摸" + data.roomInfo.guize.fengding + "封顶 ") +
            (data.roomInfo.guize.yu_type == -1 ? "" : data.roomInfo.guize.yu_type == 1 ? "一五九钓鱼 " : "跟庄钓鱼 ") +
            (data.roomInfo.guize.hua == 0 ? "" : "有花 ") + (data.roomInfo.guize.fenghu == 0 ? "" : "四笔封胡 ") +
            (data.roomInfo.guize.wufeng == 0 ? "" : "无风");

        let num = parseInt(data.roomInfo.guize.renshu);
        let num_0 = data.userInfo.length;
            for(let i = 0; i < 4; i++){
            let node = this.node.getChildByName("seat_" + i);
            let ti = node.getChildByName("button");
            let label_0 = node.getChildByName("label_name").getComponent(cc.Label);
            let label_1 = node.getChildByName("label_id").getComponent(cc.Label);
            if(i < num){
                node.active = true;
                ti.active = false;
                if(i < num_0){
                    if(3 == cc.hallControl.club_level || 2 == cc.hallControl.club_level){
                        ti.active = true;
                    }
                    let remoteUrl = data.userInfo[i].headimgurl;
                    cc.hallControl.loadHeadTexture(node,remoteUrl);
                    let str = cc.vv.Global.getNameThree(data.userInfo[i].nickname);
                    label_0.string = str;
                    label_1.string = "ID" + data.userInfo[i].id;
                }else{
                    //cc.log("头像还原");
                    node.getComponent(cc.Sprite).spriteFrame = this.head;
                    label_0.string = "";
                    label_1.string = "";
                }
            }else{
                node.active = false;
            }
        }
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case "close":
            {
                this.closeWanfa();
                break;
            }
            case "jiesan":
            {
                cc.loadingControl.onToggleView('notice_layer', '是否解散该房间？', this.closeRoom.bind(this));
                break;
            }
            case "join":
            {
                if (cc.vv.Global.room_id) {
                    cc.loginControl.sendJoinRoom(cc.vv.Global.room_id);
                    return;
                }

                this.joinRoom();
                break;
            }
            case "copy":
            {
                cc.loadingControl.onToggleView('notice_layer', '已复制，是否跳转到微信？', this.shareRoom.bind(this));
                break;
            }
            case "kick_0":
            case "kick_1":
            case "kick_2":
            case "kick_3":
            {
                let num = parseInt(type[type.length - 1]);
                this.kickPlayer(num);
                break;
            }
        }
    },

    /**
     * 复制房号及玩法并分享到微信
     */
    shareRoom:function(){
        let lab = cc.find("wenzi_bg/label_wanfa",this.node).getComponent(cc.Label).string;
        let str = "大赢家 房间号:[" + this.roomInfo.guize.room_id +  "]," + lab + "\n（复制此消息打开游戏可直接进入该房间）";
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            cc.vv.Global.shareAndroid(str);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            cc.vv.Global.shareIos(str);
        }
    },

    /**
     * 显示操作按钮
     */
    showBtn: function () {
        let btn_0 = this.node.getChildByName("btn_0");
        let btn_1 = this.node.getChildByName("btn_1");
        if(3 == cc.hallControl.club_level || 2 == cc.hallControl.club_level){
            btn_0.active = true;
            btn_1.active = true;
        }else{
            btn_0.active = false;
            btn_1.active = false;
        }
    },

    /**
     * 停止自动开房
     */
    closeWanfa: function () {
        cc.clubControl.closeWanfa(this.roomInfo.guize.guize_id);
    },

    /**
     * 解散房间
     */
    closeRoom: function () {
        cc.vv.WebSocket.sendWS('RoomController', 'jiesan', {
            mid: cc.vv.userData.mid,
            room_id: this.roomInfo.guize.room_id,
            status:1
        });

        cc.clubControl.getClubGames();
    },

    /**
     * 进入房间
     */
    joinRoom: function () {
        cc.vv.WebSocket.sendWS("RoomController", "join", {
            "mid": cc.vv.userData.mid,
            'room_id': this.roomInfo.guize.room_id
        });
    },

    /**
     * 踢玩家
     */
    kickPlayer: function (num) {
        cc.vv.WebSocket.sendWS('RoomController', 'remove', {
            mid: cc.vv.userData.mid,
            uid: this.userInfo[num].id,
            room_id: this.roomInfo.guize.room_id
        });
    }
});
