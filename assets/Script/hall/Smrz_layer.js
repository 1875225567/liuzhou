/**
 * 实名认证
 */
cc.Class({
    extends: cc.Component,

    properties: {
        editbox_arr: [cc.EditBox]
    },
    ctor: function () {
        this.hallControl = cc.hallControl;
        this.isShowing = false;
    },
    onLoad: function () {
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
        this.hallControl = null;
        cc.loader.setAutoReleaseRecursively('Prefab/hall/smzr_layer', true);
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
                    this.onClickView();
                    //请求实名认证
                    this.sendRequest();
                    break;
                }
        }
    },
    sendRequest: function () {

    },
    onReturnData: function (data) {
        if (data.status == 1) {
            this.hallControl.showMsg('认证成功!')
            this.onClickView();
        }
    }
});