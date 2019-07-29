cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {

    },

    onOpenView: function (data,index) {
        cc.log(data);
        this.showBtn();
        this.club_data = data;
        this.list_index = index;

        let label_0 = this.node.getChildByName("lab_number").getComponent(cc.Label);
        let label_1 = this.node.getChildByName("title").getComponent(cc.Label);
        let label_2 = this.node.getChildByName("label_club_id").getComponent(cc.Label);
        label_0.string = index + 1;
        label_1.string = "柳州麻将 " + data.title;
        label_2.string = "柳州麻将 " + (data.guize.menqing == 1 ? "门清 " : "") +
            (data.guize.fangfei == 1 ? "房费均摊 " : data.guize.fangfei == 2 ? "房主支付 ":"俱乐部支付 ") +
            (data.guize.yu_num == 1 ? "爆炸鱼 " : "钓" + data.guize.yu_num + "条鱼 ") +
            (data.guize.fengding == 0 ? "无限番 " : "自摸" + data.guize.fengding + "封顶 ") +
            (data.guize.yu_type == -1 ? "" : data.guize.yu_type == 1 ? "一五九钓鱼 " : "跟庄钓鱼 ") +
            (data.guize.hua == 0 ? "" : "有花 ") + (data.guize.fenghu == 0 ? "" : "四笔封胡 ") +
            (data.guize.wufeng == 0 ? "" : "无风");

        let bg = this.node.getChildByName("selected_bg");
        let btn = this.node.getChildByName("btn_0");
        bg.active = false;
        btn.active = true;
        if(index == cc.clubControl.wanfa_num){
            bg.active = true;
            btn.active = false;
        }
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case "close":
            {
                cc.loadingControl.onToggleView('notice_layer', '是否停止该自动开房？', this.closeWanfa.bind(this));
                break;
            }
            case "change":
            {
                cc.loadingControl.onToggleView('notice_layer', '是否切换玩法？', function(){
                    cc.clubControl.openWanfa();
                    cc.clubControl.wanfa_num = this.list_index;
                    cc.clubControl.changeTog();
                    cc.clubControl.showWanfaRooms();
                }.bind(this));
                break;
            }
        }
    },

    /**
     * 显示操作按钮
     */
    showBtn: function () {
        let btn_0 = this.node.getChildByName("btn");
        if(3 == cc.hallControl.club_level || 2 == cc.hallControl.club_level){
            btn_0.active = true;
        }else{
            btn_0.active = false;
        }
    },

    /**
     * 停止自动开房
     */
    closeWanfa:function(){
        cc.clubControl.closeWanfa(this.club_data.guize_id);
    },

    /**
     * 进入房间
     */
    joinRoom: function () {
        cc.vv.WebSocket.sendWS("RoomController", "join", {
            "mid": cc.vv.userData.mid,
            'room_id': this.club_data.roomInfo.guize.room_id
        });
    }

});
