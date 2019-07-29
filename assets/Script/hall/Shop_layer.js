cc.Class({
    extends: cc.Component,

    properties: {

    },

    ctoe: function () {
        this.hallControl = cc.hallControl;
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
        this.hallControl = null;
        cc.loader.setAutoReleaseRecursively('Prefab/hall/shop_layer', true);
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'back':
                {
                    this.onClickView();
                    break;
                }
            case 'shop_0':
            case 'shop_1':
            case 'shop_2':
            case 'shop_3':
                {
                    var arr = type.toString().split('_');
                    var index = parseInt(arr[1]);
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
            var arr = data.data;
            let bg = this.node.getChildByName('bg');
            for (let i = 0; i < 4; i++) {
                let item = bg.getChildByName('item' + i);
                let lab0 = item.getChildByName('lab0').getComponent(cc.Label);
                let lab1 = item.getChildByName('lab1').getComponent(cc.Label);
                lab0.string = arr[i].num + '钻石';
                lab1.string = '￥' + arr[i].money;
            }
        }
    }
});