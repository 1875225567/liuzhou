/**
 * 语音
 */
cc.Class({
    extends: cc.Component,

    properties: {
        view_arr: [cc.Node]
    },
    
    ctor: function () {
        this.isShowing = false;
    },

    onLoad: function () {

    },

    onDestroy: function () {
        cc.loader.setAutoReleaseRecursively('Prefab/game/voice_layer', true);
    },

    onOpenView: function (index) {
        this.updateView(index);
        if (index == 0) {
            this.onClickView();
        }
    },

    onClickView: function () {
        this.node.active = false;
        this.view_arr[0].active = false;
        this.view_arr[1].active = false;
    },
    
    updateView: function (index) {
        for (let i = 0; i < this.view_arr.length; i++) {
            let view = this.view_arr[i];
            view.active = i === index ? true : false;
        }
    }

    //onOpenView: function (index) {
    //    this.isShowing = true;
    //    this.updateView(index);
    //    var bg = this.node;
    //    bg.scale = 0;
    //    bg.runAction(cc.sequence(
    //        cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
    //        cc.callFunc(function () {
    //            this.isShowing = false;
    //            if (index == 0) {
    //                this.onClickView();
    //            }
    //        }.bind(this))
    //    ));
    //},
    //onClickView: function () {
    //    this.isShowing = true;
    //    var bg = this.node;
    //    bg.scale = 1;
    //    bg.runAction(cc.sequence(
    //        cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
    //        cc.callFunc(function () {
    //            this.isShowing = false;
    //            this.node.active = false;
    //        }.bind(this))
    //    ));
    //},
    //updateView: function (index) {
    //    for (let i = 0; i < this.view_arr.length; i++) {
    //        let view = this.view_arr[i];
    //        view.active = i == index ? true : false;
    //    }
    //}
});