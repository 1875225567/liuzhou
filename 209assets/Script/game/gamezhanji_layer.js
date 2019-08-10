
cc.Class({
    extends: cc.Component,

    properties: {
        room_id:cc.Label,
        club_id:cc.Label,
        time:cc.Label
    },

    ctor: function () {
        this.isShowing = false;
        this.resultData = null;
    },

    onLoad () {},

    onDestroy: function () {
        //cc.loader.setAutoReleaseRecursively('Prefab/game/zhanji_layer', true);
    },

    onOpenView: function (data) {
        cc.log(data);
        this.resultData = data;
        this.isShowing = true;
        var bg = this.node;
        bg.scale = 0;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
            cc.callFunc(function () {
                this.isShowing = false;
                this.showZhanji();
            }.bind(this))
        ));
    },

    showZhanji:function(){
        this.room_id.string = "房间号: " + cc.vv.Global.room_id;
        this.time.string = cc.vv.Global.dateFtt(new Date());
        this.club_id.string = "";
        if("" != this.resultData.guize.club_id){
            this.club_id.string = "俱乐部id: " + this.resultData.guize.club_id;
        }
        //var max_fen = -1;
        let id_arr = cc.gameControl.player_id_arr;
        for(var i = 0; i < id_arr.length; i++) {
            if(0 == id_arr[i]) continue;
            let node = cc.find("item_node/item" + i,this.node);
            node.active = true;
            //展示昵称头像
            node.getChildByName("nickname").getComponent(cc.Label).string = cc.vv.Global.getNameStr(this.resultData.userInfo[id_arr[i]].nickname);
            node.getChildByName("id").getComponent(cc.Label).string = id_arr[i];
            let head = node.getChildByName("mask").getChildByName("head").getComponent(cc.Sprite);
            let head_url = this.resultData.userInfo[id_arr[i]].headimgurl;
            node.getChildByName("fen").getComponent(cc.Label).string = this.resultData.zongfen[id_arr[i]];
            //if(parseInt(this.resultData.zongfen[id_arr[i]])>max_fen){
            //    max_fen = parseInt(this.resultData.zongfen[id_arr[i]]);
            //}
            node.getChildByName("hu_num").getComponent(cc.Label).string = "胡牌次数： " + this.resultData.zhanji[id_arr[i]].hu;
            node.getChildByName("pao_num").getComponent(cc.Label).string = "点炮次数： " + this.resultData.zhanji[id_arr[i]].pao;
            node.getChildByName("gang_num").getComponent(cc.Label).string = "公杠次数： " + this.resultData.zhanji[id_arr[i]].mg;
            node.getChildByName("angang_num").getComponent(cc.Label).string = "暗杠次数： " + this.resultData.zhanji[id_arr[i]].ag;
            node.getChildByName("ma_num").getComponent(cc.Label).string = "中鱼次数： " + this.resultData.zhanji[id_arr[i]].ma;
            node.getChildByName("hua_num").getComponent(cc.Label).string = "中花次数： " + this.resultData.zhanji[id_arr[i]].hua;

            if(id_arr[i].toString() == cc.vv.userData.mid.toString()){              //针对玩家自己  整体颜色变化
                node.color = cc.color(180,255,255);
                node.getChildByName("nickname").color = cc.color(0,120,120);
                node.getChildByName("id").color = cc.color(0,120,120);
                node.getChildByName("hu_num").color = cc.color(0,120,120);
                node.getChildByName("pao_num").color = cc.color(0,120,120);
                node.getChildByName("gang_num").color = cc.color(0,120,120);
                node.getChildByName("angang_num").color = cc.color(0,120,120);
                node.getChildByName("ma_num").color = cc.color(0,120,120);
                node.getChildByName("hua_num").color = cc.color(0,120,120);
                node.getChildByName("fen").color = cc.color(0,120,120)
            }else{
                node.color = cc.color(255,255,255);
                node.getChildByName("nickname").color = cc.color(66,0,0);
                node.getChildByName("id").color = cc.color(66,0,0);
                node.getChildByName("hu_num").color = cc.color(66,0,0);
                node.getChildByName("pao_num").color = cc.color(66,0,0);
                node.getChildByName("gang_num").color = cc.color(66,0,0);
                node.getChildByName("angang_num").color = cc.color(66,0,0);
                node.getChildByName("ma_num").color = cc.color(66,0,0);
                node.getChildByName("hua_num").color = cc.color(66,0,0);
                node.getChildByName("fen").color = cc.color(66,0,0)
            }
            cc.loader.load(head_url, function (err, texture) {
                head.spriteFrame = new cc.SpriteFrame(texture);
            });
            var isWinner = false;
            for(var x = 0; x < this.resultData.dyj.length; x++){
                if(this.resultData.dyj[x].toString() == id_arr[i].toString()){
                    isWinner = true;
                    break;
                }
            }
            node.getChildByName("winner").active = isWinner;
        }
    },

    /**
     * 点击返回大厅按钮
     * 点击返回大厅按钮
     */
    onBackClicked:function(){
        cc.gameControl.loadSceneByName('hall_scene');
        cc.gameControl.onDestroy();
        this.onDestroy();
    },

    /**
     * 点击了分享按钮
     */
    onShareClicked:function(){

    },

    /**
     * 展示牌面（手牌，桌面拍，吃碰杠牌）
     * @param maj 节点
     * @param pai 牌面数据
     */
    showMajIcon:function(maj, pai){
        maj.pai = pai;
        var icon = maj.getComponent(cc.Sprite);
        if(pai == -1){
            icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-paibei_my_2");
        }else{
            icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-mydown_" + pai);
        }
    },

    onClickView: function () {
        this.isShowing = true;
        var bg = this.node;
        bg.scale = 1;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
            cc.callFunc(function () {
                this.isShowing = false;
                this.node.active = false;
            }.bind(this))
        ));
    }
});
