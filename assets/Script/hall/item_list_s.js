cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {

    },

    onOpenView: function (data) {
        //cc.log(data);
        this.item_data = data;

        let lab0 = this.node.getChildByName("label_club_name").getComponent(cc.Label);
        let lab1 = this.node.getChildByName("label_club_id").getComponent(cc.Label);
        let lab2 = this.node.getChildByName("label_club_number").getComponent(cc.Label);

        lab0.string = data.name;
        lab1.string = data.id;
        lab2.string = data.zaixian + "/" + data.zong;

        let bg = this.node.getChildByName("bg");
        let btn = this.node.getChildByName("btn");
        bg.active = false;
        btn.active = true;
        if(data.id == cc.clubControl.club_data.id){
            bg.active = true;
            btn.active = false;
        }
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case "check":
            {
                this.getClubLevel();
                this.enterClub();
                break;
            }
        }
    },

    /**
     * 请求自己在俱乐部的成员等级
     */
    getClubLevel:function(){
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.item_data.id
        };

        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "my_club_info", postData, function(data){
            cc.log(data);
            if (1 == data.status) {
                cc.hallControl.club_level = data.data.my_info.status;
                cc.hallControl.club_status = data.data.club.status;
            }
        });
    },

    /**
     * 获取俱乐部信息，并进入俱乐部场景
     */
    enterClub: function () {
        var postData = {
            "club_id": this.item_data.id
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_index", postData, function(data){
            if(1 == data.status){
                cc.log(data);
                let _switch = cc.clubControl.node.getChildByName("switch");
                _switch.active = false;
                cc.hallControl.showMsg("俱乐部切换成功，正在加载新俱乐部中");

                cc.clubControl.onOpenView(data.data);
            }
        }.bind(this));
    }
});
