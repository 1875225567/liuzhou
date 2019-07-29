/**
 * 提示或者退出
 */
cc.Class({
    extends: cc.Component,

    properties: {
        zIndex: 99,
        lab: cc.Label
    },

    ctor: function () {
        this.isShowing = false;
        this.msg = '';
        this.callBackFunc = null;
    },

    onLoad: function () {
        this.node.zIndex = this.zIndex;
    },

    start(){
        this.onOpenView(this.msg, this.callBackFunc);
    },

    onOpenView: function (msg, callback) {
        this.isShowing = true;
        this.callBackFunc = callback;
        this.lab.string = msg;
        var bg = this.node.getChildByName('bg');
        bg.scale = 0;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
            cc.callFunc(function () {
                this.isShowing = false;
            }.bind(this))
        ));
    },

    onClickView: function (bool) {
        this.isShowing = true;
        if(!bool && cc.vv.userData.exitGame) cc.vv.userData.exitGame = false;
        if(cc.vv.userData.exitGame){
            if (bool == true && this.callBackFunc != null) {
                this.callBackFunc();
            }
            this.node.active = false;
            return;
        }
        var bg = this.node.getChildByName('bg');
        bg.scale = 1;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.1, 0).easing(cc.easeBackIn()),
            cc.callFunc(function () {
                this.isShowing = false;
                if (bool == true && this.callBackFunc != null) {
                    this.callBackFunc();
                }
                this.node.active = false;
            }.bind(this))
        ));
    },

    onDestroy: function () {
        //cc.loader.setAutoReleaseRecursively('Prefab/login/notice_layer', true);
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'back':
            {
                this.onClickView(false);
                break;
            }
            case 'ok':
            {
                this.onClickView(true);
                break;
            }
        }
    }
});