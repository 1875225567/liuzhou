cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {
        //this.onOpenView();
    },

    onOpenView: function (data,compent) {
        cc.log(data);
        this.club_data = data;
        this.com = compent;
        let btn_0 = this.node.getChildByName("btn_0");
        btn_0.active = false;
        if(1 == data.status){
            if(2 == cc.hallControl.club_level || 3 == cc.hallControl.club_level){
                btn_0.active = true;
            }
        }else if(2 == data.status && 3 == cc.hallControl.club_level){
            btn_0.active = true;
        }

        let label_0 = this.node.getChildByName("label_name").getComponent(cc.Label);
        let label_1 = this.node.getChildByName("label_id").getComponent(cc.Label);
        let label_2 = this.node.getChildByName("label_zhi").getComponent(cc.Label);
        let label_3 = this.node.getChildByName("label_time").getComponent(cc.Label);
        let label_4 = this.node.getChildByName("label_ji").getComponent(cc.Label);
        let label_5 = this.node.getChildByName("label_last").getComponent(cc.Label);
        let str = "";
        if(3 == data.status){
            str = "创建者";
        }else if(2 == data.status){
            str = "管理员";
        }else if(0 == data.jin){
            str = "禁赛中";
        }else if(1 == data.status){
            str = "普通成员";
        }

        let userName = cc.vv.Global.getNameThree(data.nickname);
        label_0.string = userName;
        label_1.string = data.mid;
        label_2.string = str;
        label_3.string = data.created_at;
        label_4.string = data.jifen;

        let date = data.updated_at;
        date = date.substring(0,19);
        date = date.replace(/-/g,'/');
        let timestamp = new Date(date).getTime();
        let now = parseInt(new Date().getTime());    // 当前时间戳;
        let timer = now - timestamp;
        let num = timer / 1000 / 60 / 60 / 24;
        let str_0 = "天前";
        if(1 > num){
            num *= 24;
            str_0 = "小时前";
            if(1 > num){
                num *= 60;
                str_0 = "分钟前";
                if(1 > num){
                    num *= 60;
                    str_0 = "秒前";
                }
            }
        }
        num = Math.floor(num);
        label_5.string = num + str_0;

        let head = this.node.getChildByName("head").getComponent(cc.Sprite);
        cc.loader.load(data.headimgurl, function (err, texture) {
            head.spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case "expand":
            {
                this.com.showBtnPop(event.target,this.club_data);
                //this.showBtn();
                break;
            }
        }
    }
});
