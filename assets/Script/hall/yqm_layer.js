/**
 * 邀请码
 */
cc.Class({
    extends: cc.Component,

    properties: {
        code_edit:cc.EditBox,  //邀请码
        view_arr:[cc.Node]
    },

    ctor: function () {
        this.isShowing = false;
        this.bindStatus = false; 
    },

    onLoad: function () {
        this.bindStatus = cc.vv.Global.bindStatus;
        this.initView();
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
        cc.loader.setAutoReleaseRecursively('Prefab/hall/share_layer', true);
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
                this.sendBind();
                break;
            }
        }
    },

    initView:function(){
        this.view_arr[0].active = this.bindStatus == true ? false : true;
        this.view_arr[1].active = !this.view_arr[0].active;
    },

    sendBind:function () {
        let pid = parseInt(this.code_edit.string);
        var postData = {
            "mid":cc.vv.userData.mid,
            "pid":pid
        };
        cc.vv.http.sendRequest(cc.vv.http.bind_url,postData,this.onReturnBind.bind(this));
    },

    onReturnBind:function(data){
        if(data.status == 1){
            this.bindStatus = true;
            this.onClickView();
        }else{
            cc.loadingControl.showMsg(data.msg);
        }
    }
});