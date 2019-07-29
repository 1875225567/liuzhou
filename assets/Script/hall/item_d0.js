cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        this.item_data = null;
        this.compent = null;

    },

    onOpenView: function (data,com) {
        this.item_data = data;
        this.compent = com;
        //cc.log(data);

        let lab_0 = this.node.getChildByName("lab_number").getComponent(cc.Label);
        let lab_1 = this.node.getChildByName("lab_ju").getComponent(cc.Label);
        let lab_2 = this.node.getChildByName("lab_ren").getComponent(cc.Label);

        lab_0.string = data.room_id;
        lab_1.string = data.jushu;
        lab_2.string = data.users + "/" + data.renshu;
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'qing':
            {
                this.node.active = false;
                break;
            }
            case 'san':
            {
                cc.vv.WebSocket.sendWS('RoomController', 'jiesan', {
                    mid: cc.vv.userData.mid,
                    room_id: this.item_data.room_id,
                    status:1
                });

                this.scheduleOnce(function() {
                    this.compent.RefreshAgentData();
                }.bind(this), 0.8);
                break;
            }
        }
    },

    // update (dt) {},
});
