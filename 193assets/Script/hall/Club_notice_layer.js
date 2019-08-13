/**
 * 俱乐部提示
 */
cc.Class({
    extends: cc.Component,

    properties: {
        zIndex: 1,
        lab: cc.Label
    },
    ctor: function () {
        this.kefu_str = 'lzmj266';
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
        cc.loader.setAutoReleaseRecursively('Prefab/hall/club_notice_layer', true);
    },
    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'club_notice_layer':
                {
                    this.onClickView();
                    break;
                }
            case 'copy':
                {
                    this.onClickView();
                    if (cc.sys.os == cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "copyStrSet", "(Ljava/lang/String;)V", this.kefu_str);
                    } else if (cc.sys.os == cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod("RootViewController", "copyStrSet:", this.kefu_str);
                    }
                    break;
                }
        }
    }
});