var TEXT_ARR = [
    '速度定，得蛮',
    '我躲呼咯蛮夺八了哇哦',
    '盼盼夺是我爱，卖兰咯',
    '里呼打点得蛮',
    '里总封跑我给认歌呀',
    '很歌由咩根恩咯哦',
    '你理牌打嘞蒜吼撩'
];
var END_X = 386;
var BEGIN_X = 1008;
/**
 * 聊天框
 */
cc.Class({
    extends: cc.Component,

    properties: {
        view_arr: [cc.Node],
        editbox: cc.EditBox
    },

    ctor: function () {
        this.isShowing = false;
        this.chat_type = 0;
        this.msg = '';
    },

    onLoad: function () {
        this.onOpenView();
    },

    onOpenView: function () {
        this.isShowing = true;
        var bg = this.node.getChildByName('bg');
        bg.opactiy = 0;
        bg.x = BEGIN_X;
        bg.runAction(cc.sequence(
            cc.spawn(
                cc.fadeIn(0.3),
                cc.moveTo(0.3, cc.v2(END_X, 0)).easing(cc.easeBackOut())
            ),
            cc.callFunc(function () {
                this.isShowing = false;
            }.bind(this))
        ));
    },

    onClickView: function () {
        this.isShowing = true;
        var bg = this.node.getChildByName('bg');
        bg.opactiy = 255;
        bg.x = END_X;
        bg.runAction(cc.sequence(
            cc.spawn(
                cc.fadeOut(0.3),
                cc.moveTo(0.3, cc.v2(BEGIN_X, 0)).easing(cc.easeBackIn())
            ),
            cc.callFunc(function () {
                this.isShowing = false;
                this.node.active = false;
            }.bind(this))
        ));
    },

    upateView: function (index) {
        for (let i = 0; i < 2; i++) {
            let view = this.view_arr[i];
            view.active = i == index ? true : false;
        }
    },

    sendRequest: function () {
        var data = {
                'mid':cc.vv.userData.mid,
                'room_id':cc.vv.Global.room_id,
                'type':this.chat_type,
                'msg':this.msg,
                'toMid':null
        };
        cc.vv.WebSocket.sendWS('RoomController','xiaoxi',data);
    },

    onReturnData: function (data) {

    },

    onDestroy: function () {
        cc.loader.setAutoReleaseRecursively('Prefab/game/chat_layer', true);
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'back':
                {
                    this.onClickView();
                    break;
                }
            case 'ok':
                {
                    this.chat_type = 2;
                    this.msg = this.editbox.string;
                    this.sendRequest();
                    break;
                }
            case 'chat_0':
            case 'chat_1':
                {
                    var arr = type.toString().split('_');
                    var index = parseInt(arr[1]);
                    this.chat_type = index;
                    this.upateView(index);
                    break;
                }
            case 'face_0':
            case 'face_1':
            case 'face_2':
            case 'face_3':
            case 'face_4':
            case 'face_5':
            case 'face_6':
            case 'face_7':
            case 'face_8':
            case 'face_9':
            case 'face_10':
            case 'face_11':
            case 'face_12':
            case 'face_13':
            case 'face_14':
            case 'face_15':
            case 'face_16':
            case 'face_17':
            case 'face_18':
            case 'face_19':
                {
                    this.chat_type = 0;
                    var arr = type.toString().split('_');
                    var index = parseInt(arr[1]);
                    this.msg = index;
                    this.sendRequest();
                    break;
                }
            case 'text_0':
            case 'text_1':
            case 'text_2':
            case 'text_3':
            case 'text_4':
            case 'text_5':
            case 'text_6':
                {
                    this.chat_type = 1;
                    var arr = type.toString().split('_');
                    var index = parseInt(arr[1]);
                    this.msg = index;
                    this.sendRequest();
                    break;
                }
        }
    }
});