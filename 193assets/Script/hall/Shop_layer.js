cc.Class({
    extends: cc.Component,

    properties: {
        item:cc.Prefab
    },

    ctor: function () {
        //this.hallControl = cc.hallControl;
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
                this.sendRequest();
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
        //this.hallControl = null;
        //cc.loader.setAutoReleaseRecursively('Prefab/hall/shop_layer', true);
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'back':
            {
                this.onClickView();
                break;
            }
        }
    },

    /**
     * 请求商城数据
     */
    sendRequest: function () {
        var postData = {
            "mid": cc.vv.userData.mid
        };
        cc.vv.http.sendRequest(cc.vv.http.goods_url, postData, this.onReturnData.bind(this));
    },

    /**
     * 返回商场数据
     */
    onReturnData: function (data) {
         cc.log(data);
        if (data.status == 1) {
            let content = cc.find("bg/scrollView/view/content", this.node);
            let arr = data.data;
            let len = arr.length;
            let child_arr = content.children;
            let child_len = content.childrenCount;
            let max_len = Math.max(len, child_len);
            for (let i = 0; i < max_len; i++) {
                let item = null;
                if (len && i < len) {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = true;
                    } else {
                        item = cc.instantiate(this.item);
                        item.parent = content;
                    }
                    let js = item.getComponent("shop_item");
                    js.onOpenView(arr[i],i + 1,this);
                } else {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = false;
                    }
                }
            }
        }
    },

    /**
     * 请求充值二维码
     */
    getChong: function () {
        this.onClickView();
        cc.hallControl.onToggleView("kefu_layer");
        //var postData = {
        //    "mid": cc.vv.userData.mid
        //};
        //let url = cc.vv.http.URL;
        //cc.vv.http.sendRequest(url + "zhifu", postData, this.chongZhi.bind(this));
    },

    chongZhi:function(data){
        cc.log(data);
    }
});