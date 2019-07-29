cc.Class({
    extends: cc.Component,

    properties: {
    },

     onLoad () {

     },

    onOpenView: function (data,com) {
        cc.log(data);
        this.item_data = data;
        this.compent = com;
        let title = this.node.getChildByName("title").getComponent(cc.Label);
        let label = this.node.getChildByName("label").getComponent(cc.Label);
        title.string = data.name + data.unit;
        label.string = data.price;
    },

    onClickBtn: function () {
        //cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        var postData = {
            mid: cc.vv.userData.mid,
            gid: this.item_data.id,
            num:1
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "exchange", postData, this.onReturnData.bind(this));
    },

    onReturnData:function(data){
        cc.log(data);
        cc.loadingControl.showMsg(data.msg);
        if(1 == data.status){
            cc.vv.userData.num = data.data.num;
            cc.hallControl.win_number = data.data.win;

            this.compent.loadViewData();
        }
    }
});
