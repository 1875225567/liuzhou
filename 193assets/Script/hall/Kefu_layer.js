/**
 * 客服微信、公众号
 */
cc.Class({
    extends: cc.Component,

    properties: {
        wechat0_lab:cc.Label,  //公众号
        wechat1_lab:cc.Label  //微信号

    },

    ctor: function () {
        this.isShowing = false;
        this.weixin = "";
    },

    onLoad: function () {
        this.onOpenView();
    },

    onOpenView: function () {
        this.getKefu();
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

    /**
     * 获取最新客服微信账号
     */
    getKefu:function(){
        let postData = {
            "mid": cc.vv.userData.mid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "kefu", postData, function(data){
            cc.log(data);
            if (data.msg) this.showMsg(data.msg);
            if (1 == data.status) {
                this.wechat0_lab.string = data.data[0].content;
                this.wechat1_lab.string = data.data[1].content;
            }
        }.bind(this));
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
        //cc.loader.setAutoReleaseRecursively('Prefab/hall/share_layer', true);
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
            case 'copy0':
            case 'copy1':
            {
                let index = parseInt(type[type.length - 1]);
                this.weixin = index == 0 ? this.wechat0_lab.string : this.wechat1_lab.string;
                cc.log(this.weixin);
                cc.loadingControl.onToggleView('notice_layer', "已复制，是否跳转到微信？", this.shareKefu.bind(this));
                break;
            }
        }
    },

    shareKefu:function(){
        cc.vv.Global.shareAndroid(this.weixin);
    }
});