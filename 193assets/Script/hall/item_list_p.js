cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        //this.scrollview.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        //this.onOpenView();
    },

    onOpenView: function (data,compent) {
        cc.log(data);
        this.club_data = data;
        this.com = compent;

        let label_0 = this.node.getChildByName("label_day").getComponent(cc.Label);
        let label_1 = this.node.getChildByName("label_id").getComponent(cc.Label);
        label_0.string = data.date;
        label_1.string = data.num;
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case "xiang":
            {
                this.closeRoom();
                break;
            }
            case "da":
            {
                this.joinRoom();
                break;
            }
        }
    },

    /**
     * 详情
     */
    closeRoom: function () {
        var postData = {
            'date': this.club_data.date,
            "club_id": cc.clubControl.club_data.id
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_count_detail", postData, function(data){
            cc.log(data);
            this.com.item_date = this.club_data.date;
            this.com.dealForm(data,0)
        }.bind(this));
    },

    /**
     * 大赢家
     */
    joinRoom: function () {
        var postData = {
            'date': this.club_data.date,
            "club_id": cc.clubControl.club_data.id,
            'fen': 0
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_count_detail", postData, function(data){
            this.com.item_date = this.club_data.date;
            this.com.dealForm(data,1)
        }.bind(this));
    }
});
