/**
 * 进入房间
 */
cc.Class({
    extends: cc.Component,

    properties: {

    },

    ctor: function () {
        this.isShowing = false;
        this.num_arr = [];
        this.hallControl = cc.hallControl;
    },

    onOpenView: function () {
        this.isShowing = true;
        var bg = this.node.getChildByName('bg');
        bg.scale = 1;
    },

    onLoad: function () {
        for (let i = 0; i < 6; i++) {
            let lab = this.node.getChildByName('lab' + i);
            this.num_arr.push(lab);
        }
        this.resetLabNum();
    },

    onDestroy: function () {
        this.hallControl = null;
        cc.loader.setAutoReleaseRecursively('Prefab/hall/join_layer', true);
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'back':
                {
                    this.resetLabNum();
                    this.onClickView();
                    break;
                }
            case 'join_0':
            case 'join_1':
            case 'join_2':
            case 'join_3':
            case 'join_4':
            case 'join_5':
            case 'join_6':
            case 'join_7':
            case 'join_8':
            case 'join_9':
            case 'join_10': //重新输入
            case 'join_11': //删除
                {
                    var arr = type.toString().split('_');
                    var index = parseInt(arr[1]);
                    if (index == 10) {
                        this.resetLabNum();
                    } else if (index == 11) {
                        this.deletNum();
                    } else {
                        this.changeLabNum(index);
                    }
                    break;
                }
        }
    },

    onClickView: function () {
        this.node.active = !this.node.active;
    },

    resetLabNum: function () {
        for (let i = 0; i < 6; i++) {
            let lab = this.num_arr[i];
            lab.active = false;
        }
    },

    deletNum: function () {
        for (let i = 5; i >= 0; i--) {
            let lab = this.num_arr[i];
            if (lab.active == true) {
                lab.active = false;
                break;
            }
        }
    },

    changeLabNum: function (num) {
        var room_id = '';
        for (let i = 0; i < 6; i++) {
            let lab_node = this.num_arr[i];
            var lab = lab_node.getComponent(cc.Label);
            if (lab_node.active == false) {
                lab_node.active = true;
                lab.string = num.toString();
                room_id += lab.string;
                if (i == 5) {
                    this.sendJoinGame(room_id);
                }
                break;
            } else {
                room_id += lab.string;
            }
        }
    },

    /**
     * 请求进入房间
     */
    sendJoinGame: function (room_id) {
        cc.vv.WebSocket.sendWS("RoomController", "join", {
            "mid": cc.vv.userData.mid,
            'room_id': room_id
        });
    }
});