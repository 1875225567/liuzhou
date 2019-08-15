cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {

    },

    onOpenView: function (data,index,com) {
        cc.log(data,index);
        if(com) this.compent = com;
        let btn_0 = this.node.getChildByName("button_application");
        let btn_1 = this.node.getChildByName("button_enter");
        btn_0.active = false;
        btn_1.active = false;
        if(1 == index){
            btn_1.active = true;
        }else{
            btn_0.active = true;
        }

        let label_0 = this.node.getChildByName("label_name").getComponent(cc.Label);
        let label_1 = this.node.getChildByName("label_id").getComponent(cc.Label);
        let label_2 = this.node.getChildByName("label_num").getComponent(cc.Label);
        let userName = cc.vv.Global.getNameThree(data.name);
        label_0.string = userName;
        label_1.string = "ID: " + data.id;
        label_2.string = "成员: " + data.zaixian + "/" + data.zong;
        this.cid = data.id;
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case "application":
            {
                this.applicationClub();
                break;
            }
            case "enter":
            {
                this.getClubLevel();
                this.enterClub();
                break;
            }
        }
    },

    /**
     * 申请加入俱乐部
     */
    applicationClub: function () {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.cid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_join", postData, function(data){
            cc.log(data);
            if (1 == data.status) {
                this.compent.timerContrl();
            }
            if(data.msg) cc.hallControl.showMsg(data.msg);
        }.bind(this));
    },

    /**
     * 请求自己在俱乐部的成员等级
     */
    getClubLevel:function(){
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.cid
        };

        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "my_club_info", postData, function(data){
            cc.log(data);
            if (data.msg) cc.hallControl.showMsg(data.msg);
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
            "club_id": this.cid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_index", postData, function(data){
            cc.log(data);
            if (data.msg) cc.hallControl.showMsg(data.msg);
            if(1 == data.status){

                cc.hallControl.onToggleView("club_scene",data.data);
            }
        }.bind(this));
    }
});
