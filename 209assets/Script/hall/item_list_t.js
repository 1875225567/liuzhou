cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        //this.scrollview.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        //this.onOpenView();
    },

    onOpenView: function (data) {
        cc.log(data);
        this.club_data = data;

        let rooomInfo = data.roomInfo.guize;
        let lab0 = this.node.getChildByName("label_ju").getComponent(cc.Label);
        lab0.string = rooomInfo.jushu + "局";

        let num = parseInt(rooomInfo.renshu);
        let num_0 = data.userInfo.length;
        for(let i = 0; i < 4; i++){
            let seat = this.node.getChildByName("seat_" + i);
            let head = this.node.getChildByName("head_" + i);
            if(i < num){
                seat.active = true;
                if(i < num_0){
                    head.active = true;
                    seat.active = false;
                    //let head = node.getComponent(cc.Sprite);
                    let node = head.getChildByName("head");
                    let remoteUrl = data.userInfo[i].headimgurl;
                    cc.hallControl.loadHeadTexture(node,remoteUrl);
                    //cc.loader.load(remoteUrl, function (err, texture) {
                    //    cc.log(head.spriteFrame, texture);
                    //    head.spriteFrame = new cc.SpriteFrame(texture);
                    //});
                }else{
                    head.active = false;
                }
            }else{
                seat.active = false;
                head.active = false;
            }
        }
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case "showTea":
            {
                cc.clubControl.showTeaRoom(this.club_data);
                break;
            }
            case "lizuo":
            {
                cc.vv.WebSocket.sendWS('RoomController', 'lizuo', {
                    mid: cc.vv.userData.mid,
                    room_id: this.club_data.roomInfo.guize.room_id
                });
                break;
            }
            case "jinru":
            {
                this.joinRoom();
                break;
            }
        }
    },

    /**
     * 解散房间
     */
    closeRoom: function () {
        cc.vv.WebSocket.sendWS('RoomController', 'jiesan', {
            mid: cc.vv.userData.mid,
            room_id: this.club_data.roomInfo.guize.room_id,
            status:1
        });
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
