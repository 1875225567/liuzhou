cc.Class({
    extends: cc.Component,

    properties: {

    },

    onOpenView: function (data,compent,index) {
        cc.log(data);
        this.club_data = data;
        this.com = compent;
        let lab0 = this.node.getChildByName("lab0").getComponent(cc.Label);
        let lab1 = this.node.getChildByName("lab1").getComponent(cc.Label);
        lab0.string = "第" + index + "局";
        lab1.string = data.time;

        for(let i = 0; i < 4; i++){
            let node = this.node.getChildByName("player" + i);
            if(i < data.users.length){
                node.active = true;
                let label_0 = node.getChildByName("lab0").getComponent(cc.Label);
                let label_1 = node.getChildByName("lab1").getComponent(cc.Label);
                label_0.string = data.users[i].nickname;
                label_1.string = data.users[i].fen;

                let head = node.getChildByName("board").getComponent(cc.Sprite);
                cc.loader.load(data.users[i].headimgurl, function (err, texture) {
                    head.spriteFrame = new cc.SpriteFrame(texture);
                });
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
            'logs_id': this.club_data.logs_id
        };
        cc.vv.http.sendRequest(cc.vv.http.replayInfo_url, postData, this.onReturnReplayInfo.bind(this));
    },

    /**
     * 战绩回放
     */
    onReturnReplayInfo: function (data) {
        cc.vv.Global.replayData = data;
        console.log("成功获取到了回放信息");
        console.log(data);
        //成功返回回放信息

        cc.loadingControl.loadSceneByName('game_replay_scene', true);
    }
});