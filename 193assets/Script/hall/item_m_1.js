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
        let btn_0 = this.node.getChildByName("btn_0");
        btn_0.active = false;
        if(2 == cc.hallControl.club_level || 3 == cc.hallControl.club_level){
            btn_0.active = true;
        }

        let label_0 = this.node.getChildByName("label_name").getComponent(cc.Label);
        let label_1 = this.node.getChildByName("label_id").getComponent(cc.Label);
        let label_2 = this.node.getChildByName("label_time").getComponent(cc.Label);

        let userName = cc.vv.Global.getNameThree(data.nickname);
        label_0.string = userName;
        label_1.string = data.mid;
        label_2.string = data.created_at;

        let head = this.node.getChildByName("head").getComponent(cc.Sprite);
        cc.loader.load(data.headimgurl, function (err, texture) {
            head.spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            //case "expand":
            //{
            //    let show = this.node.getChildByName("sprite");
            //    if(show.active){
            //        show.active = false;
            //    }else{
            //        show.active = true;
            //    }
            //    break;
            //}
            case "agree":
            {
                this.dealWith(1);
                break;
            }
            case "refuse":
            {
                this.dealWith(0);
                break;
            }
        }
    },

    /**
     * 处理玩家申请；0不同意，1同意
     */
    dealWith: function (num) {
        //let show = this.node.getChildByName("sprite");
        //show.active = false;
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.club_data.club_id,
            "uid": this.club_data.mid,
            "status": num
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_jiaru", postData, function(data){
            cc.log(data);
            cc.hallControl.showMsg(data.msg);
            if (1 == data.status) {
                this.com.sendJoin();
            }
        }.bind(this));
    }
});
