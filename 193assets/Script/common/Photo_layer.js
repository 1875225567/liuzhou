/**
 * 访问相机相册
 */
cc.Class({
    extends: cc.Component,

    properties: {
        zIndex: 18,
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
        this.resetEdxitbox();
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
        cc.loader.setAutoReleaseRecursively('Prefab/common/photo_layer', true);
    },
    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('btn_sound', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'back':
                {
                    this.onClickView();
                    break;
                }
            case 'camera':
                {
                    if (cc.sys.os == cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "openCamera", "()V");
                    } else if (cc.sys.os == cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod("RootViewController", "openCamera");
                    }
                    this.onClickView();
                    break;
                }
            case 'album':
                {
                    if (cc.sys.os == cc.sys.OS_ANDROID) {
                        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "openAlbum", "()V");
                    } else if (cc.sys.os == cc.sys.OS_IOS) {
                        jsb.reflection.callStaticMethod("RootViewController", "openAlbum");
                    }
                    this.onClickView();
                    break;
                }
        }
    },
});