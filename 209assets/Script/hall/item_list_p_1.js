cc.Class({
    extends: cc.Component,

    properties: {

    },

    onOpenView: function (data,compent) {
        cc.log(data);
        this.club_data = data;
        this.com = compent;
        let lab1 = this.node.getChildByName("lab1").getComponent(cc.Label);
        lab1.string = "房号: " + data.room_id + "  " + data.updated_at + "  (" + data.jushu + "局)  柳州玩法";

        for(let i = 0; i < 4; i++){
            let node = this.node.getChildByName("player" + i);
            if(i < data.users.length){
                node.active = true;
                let label_0 = node.getChildByName("lab0").getComponent(cc.Label);
                let label_1 = node.getChildByName("lab1").getComponent(cc.Label);
                let label_2 = node.getChildByName("lab2").getComponent(cc.Label);
                label_0.string = data.users[i].nickname;
                label_1.string = data.users[i].fen;
                label_2.string = "";

                let da = node.getChildByName("da");
                if(1 == data.users[i].dayingjia){
                    da.active = true;
                }else{
                    da.active = false;
                }
            }else{
                node.active = false;
            }
        }
    },

    /**
     * 点击按钮
     */
    onClickBtnItem: function () {
        let postData = {
            'rid': this.club_data.rid
        };
        cc.vv.http.sendRequest(cc.vv.http.zhanjiInfo_url, postData, function(data){
            cc.log(data);
            this.com.dealXiang(data)
        }.bind(this));
    }
});