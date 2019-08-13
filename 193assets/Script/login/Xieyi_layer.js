var BEGIN_Y = 296;
var END_Y = 7100;
/**
 * 协议
 */
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.Node,
        content: cc.Node,
    },
    ctor: function () {
        this.isShowing = false;
    },
    onLoad: function () {
        this.scrollView.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
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
        this.scrollView.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        cc.loader.setAutoReleaseRecursively('Prefab/login/xieyi_layer', true);
    },
    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'back':
                {
                    this.node.active = !this.node.active;
                    break;
                }
        }
    },
    onTouchMove: function (event) {
        var delta = event.getDelta();
        this.content.y += delta.y * 2;
        if (this.content.y <= BEGIN_Y) {
            this.content.y = BEGIN_Y;
        } else if (this.content.y >= END_Y) {
            this.content.y = END_Y;
        }
    }
});