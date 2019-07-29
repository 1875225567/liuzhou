cc.Class({
    extends: cc.Component,

    properties: {

    },

    onOpenView: function (data,compent) {
        cc.log(data);
        this.club_data = data;
        this.com = compent;

        let label_0 = this.node.getChildByName("label_name").getComponent(cc.Label);
        let label_1 = this.node.getChildByName("label_id").getComponent(cc.Label);
        let label_2 = this.node.getChildByName("label_number").getComponent(cc.Label);
        label_0.string = data.member.nickname;
        label_1.string = "ID: " + data.mid;
        label_2.string = "获得大赢家次数: " + data.num + "次";

        let head = this.node.getChildByName("head").getComponent(cc.Sprite);
        cc.loader.load(data.member.headimgurl, function (err, texture) {
            head.spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    /**
     * 详情
     */
    closeRoom: function () {
        var postData = {
            'date': this.com.item_date,
            "club_id": cc.clubControl.club_data.id,
            'mid': cc.vv.userData.mid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_win_detail", postData, function(data){
            this.com.dealRecord(data)
        }.bind(this));
    }

});
