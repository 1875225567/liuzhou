/**
 * 分享
 */
cc.Class({
    extends: cc.Component,

    properties: {
        zIndex: 28
    },

    ctor: function () {
        this.isShowing = false;
    },

    onLoad: function () {
        this.node.zIndex = this.zIndex;
        this.onOpenView();
    },

    onOpenView: function () {
        this.isShowing = true;
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
            cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
            cc.callFunc(function () {
                this.isShowing = false;
                this.node.active = false;
            }.bind(this))
        ));
    },

    onDestroy: function () {
        cc.loader.setAutoReleaseRecursively('Prefab/common/share_layer', true);
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
            case 'share_0':
            case 'share_1':
                {
                    var arr = type.toString().split('_');
                    var shareTo = parseInt(arr[1]);
                    cc.vv.Global.shareWeChat(shareTo, 2, '【大赢家柳州麻将】', '我在【大赢家柳州麻将】等你来玩哟！');
                    this.onClickView();
                    break;
                }
            case 'share_2': //分享闲聊
                {

                    break;
                }
        }
    }
});