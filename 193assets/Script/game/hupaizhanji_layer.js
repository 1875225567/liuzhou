
cc.Class({
    extends: cc.Component,

    properties: {
        room_id:cc.Label,
        rule:cc.Label,
        time:cc.Label,
        pai_container:cc.Node,
        caozuo_prefab:cc.Prefab,
        pai_prefab:cc.Prefab,
        pai_atlas:cc.SpriteAtlas,
        pai_atlas1:cc.SpriteAtlas
    },

    ctor: function () {
        this.isShowing = false;
        this.resultData = null;
        this.start_position = cc.v2(-480, 10);
        this.control = null;
        this.isReplay = false;
        this.chipenggang_dir =  [[-1, 2, 1, 0],[0, -1, 2, 1],[1, 0, -1, 2],[2, 1, 0, -1]]
    },

    onLoad () {

    },

    onDestroy: function () {
        //cc.loader.setAutoReleaseRecursively('Prefab/game/hupaizhanji_layer', true);
    },

    onOpenView: function (data) {
        this.resultData = data;
        this.isShowing = true;
        //var bg = this.node;
        //bg.scale = 0;
        //bg.runAction(cc.sequence(
        //    cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
        //    cc.callFunc(function () {
        //        this.isShowing = false;
        //        this.showHupai();
        //    }.bind(this))
        //));
        if(cc.vv.Global.replayData != null){
            this.control = cc.gameReplayControl;
            this.isReplay = true;
        }else{
            this.control = cc.gameControl;
            this.isReplay = false;
        }
        this.isShowing = false;
        this.showHupai();
    },

    /**
     * show the hupai info
     */
    showHupai:function(){
        cc.log(this.node);
        this.room_id.string = "房间号：" + cc.vv.Global.room_id;
        this.time.string = cc.vv.Global.dateFtt(new Date());
        this.rule.string = this.resultData.guize.renshu + "人  " + (this.resultData.guize.jushu + "局  ") +
            (this.resultData.guize.menqing == 1 ? "门清  " : "  ") + (this.resultData.guize.hua.toString() == "0" ? "" : "有花 ") +
            (this.resultData.guize.wufeng.toString() == "0" ? "" : "无风 ") +
            (this.resultData.guize.fangfei == 1 ? "房费均摊  " : this.resultData.guize.fangfei == 2 ? "房主支付  ":"俱乐部支付  ") +
            (this.resultData.guize.yu_num == 1 ? "爆炸鱼  " : "钓" + this.resultData.guize.yu_num + "条鱼  ") +
            (this.resultData.guize.fengding == 0 ? "无限番  " : "自摸" + this.resultData.guize.fengding + "封顶  ") + (this.resultData.guize.fenghu.toString() == "0" ? "" : "四笔封胡 ") +
            (this.resultData.guize.yu_type == -1 ? "":this.resultData.guize.yu_type == 1 ? "一五九钓鱼" : "跟庄钓鱼");

        //console.log(this.control.player_id_arr);
        if(this.resultData.hu_mid.length > 0){
            this.node.getChildByName("title").getChildByName("title0").active = true;
            this.node.getChildByName("title").getChildByName("title1").active = false;
            this.node.getChildByName("title").getChildByName("title2").active = false;
        }else{
            this.node.getChildByName("title").getChildByName("title0").active = false;
            this.node.getChildByName("title").getChildByName("title1").active = false;
            this.node.getChildByName("title").getChildByName("title2").active = true;
        }
        console.log("展示战绩+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
        console.log(this.control.player_id_arr);
        let id_arr = this.control.player_id_arr;
        for(var i = 0; i < id_arr.length; i++){
            if(0 == id_arr[i]) continue;
            let node = this.pai_container.getChildByName("item" + i);
            node.active = true;
            node.getChildByName("hu").active = false;
            for(let t = 0; t < this.resultData.hu_mid.length; t++){
                var yu_container = node.getChildByName("yu");
                yu_container.removeAllChildren();
                if(id_arr[i].toString() == this.resultData.hu_mid[t].toString()){
                    node.getChildByName("hu").active = true;
                    yu_container.active = true;
                    var yu_position = cc.v2(30,25);
                    for(let a = 0; a < this.resultData.fish[id_arr[i]].yu.length; a++){
                        let pai = cc.instantiate(this.pai_prefab);
                        this.showMajIcon(pai, this.resultData.fish[id_arr[i]].yu[a]);
                        pai.parent = yu_container;
                        pai.scale = 0.6;
                        pai.position = yu_position;
                        pai.color = cc.color(255,255,255);
                        yu_position.x += pai.width * 0.6;
                        if(a == 5){
                            yu_position.y -= pai.height * 0.7;
                            yu_position.x = 30;
                        }
                        for(var b = 0; b < this.resultData.fish[id_arr[i]].zhong.length; b++){
                            if(this.resultData.fish[id_arr[i]].yu[a].toString() == this.resultData.fish[id_arr[i]].zhong[b].toString()){
                                pai.color = cc.color(150,255,255);
                                break;
                            }
                        }
                    }
                    if(id_arr[i].toString() == cc.vv.userData.mid.toString()){
                        this.node.getChildByName("title").getChildByName("title1").active = true;
                        this.node.getChildByName("title").getChildByName("title0").active = false;
                        this.node.getChildByName("title").getChildByName("title2").active = false;
                    }
                    break;
                }else{
                    yu_container.active = false;
                    node.getChildByName("hu").active = false;
                }
            }
            //展示昵称头像
            node.getChildByName("nickname").getComponent(cc.Label).string = cc.vv.Global.getNameStr(this.resultData.userInfo[id_arr[i]].nickname);
            node.getChildByName("id").getComponent(cc.Label).string = "ID:" + this.resultData.userInfo[id_arr[i]].id;
            let head = node.getChildByName("mask").getChildByName("head").getComponent(cc.Sprite);
            let head_url = this.resultData.userInfo[id_arr[i]].headimgurl;
            node.getChildByName("fen").getComponent(cc.Label).string = this.resultData.result[id_arr[i]];
            if(parseInt(this.resultData.result[id_arr[i]]) > 0){
                node.getChildByName("fen").color = cc.color(255,255,150);
            }else{
                node.getChildByName("fen").color = cc.color(150,255,255);
            }
            let str = this.resultData.title[id_arr[i]];
            if("+" == str[0]) str = str.substring(1);
            if("+" == str[str.length - 1]) str = str.substring(0,str.length - 1);
            node.getChildByName("title").getComponent(cc.Label).string = str;
            cc.loader.load(head_url, function (err, texture) {
                head.spriteFrame = new cc.SpriteFrame(texture);
            });

            if(this.control.zhuang.toString() == id_arr[i].toString()){
                node.getChildByName("zhuang").active = true;
            }else{
                node.getChildByName("zhuang").active = false;
            }

            //展示玩家胡牌信息
            var z = this.resultData.userPais[id_arr[i]].z;
            var temp = cc.v2(this.start_position.x,this.start_position.y);
            if(z != null && z.length > 0){     //有过操作的吃碰杠牌面
                for(let t = 0; t < z.length; t++){
                    var obj = z[t];
                    var special_maj = cc.instantiate(this.caozuo_prefab);
                    var da_dir = -1;
                    for(var x = 0; x < id_arr.length; x++){
                        var id = id_arr[x];
                        if(id.toString() == obj.d_mid.toString()){
                            if(this.control.game_ren == 2 && x == 1){
                                da_dir = 2;
                            }else{
                                da_dir = x;
                            }
                            break;
                        }
                    }
                    if(obj.status.toString() == "1"){
                        for (let a = 0; a < 3; a++) {
                            let pai = special_maj.getChildByName("pai"+a);
                            this.showMajIcon(pai, obj.pais[a]);
                            if(a == 0){
                                pai.color = cc.color(150,255,255)
                            }
                        }
                    }else if(obj.status.toString() == "2"){
                        console.log("this.chipenggang" + this.chipenggang_dir);
                        console.log("i=" + i);
                        console.log("da_dir=" + da_dir);
                        console.log("this.chipenggang_dir[i][da_dir]=" + this.chipenggang_dir[i][da_dir]);
                        for (let a = 0; a < 3; a++) {
                            let pai = special_maj.getChildByName("pai" + a);
                            this.showMajIcon(pai, obj.pais[a]);
                            if(a == this.chipenggang_dir[i][da_dir]){
                                pai.color = cc.color(150, 255, 255)
                            }
                        }
                    }else {
                        special_maj.getChildByName("pai3").active = true;
                        for (let a = 0; a < 4; a++) {
                            let pai = special_maj.getChildByName("pai" + a);
                            if(obj.d_mid.toString() == ""){
                                if(a == 3){
                                    this.showMajIcon(pai, obj.pais[a]);
                                }else{
                                    this.showMajIcon(pai, -1);
                                }
                            }else{
                                this.showMajIcon(pai, obj.pais[a]);
                                if(this.chipenggang_dir[i][da_dir] == 1 && (a == 3 || a == 1)){
                                    pai.color = cc.color(150,255,255)
                                }else if(a == this.chipenggang_dir[i][da_dir]){
                                    pai.color = cc.color(150,255,255)
                                }
                            }
                        }
                    }
                    special_maj.parent = node.getChildByName("pai");
                    special_maj.scale = 0.8;
                    special_maj.position = temp;
                    temp.x += special_maj.width * 0.8 + 20;
                }
            }
            temp.x += 20;
            var s =  this.resultData.userPais[id_arr[i]].s;
            for(let t = 0; t < s.length; t++){
                let pai = cc.instantiate(this.pai_prefab);
                this.showMajIcon(pai,s[t]);
                pai.parent = node.getChildByName("pai");
                pai.scale = 0.8;
                pai.position = temp;
                temp.x += pai.width * 0.8;
            }
            temp.x += 20;
            for(let t = 0; t < this.resultData.hu_mid.length; t++){
                if(id_arr[i].toString() == this.resultData.hu_mid[t].toString()){
                    let pai = cc.instantiate(this.pai_prefab);
                    this.showMajIcon(pai, this.resultData.pai);
                    pai.parent = node.getChildByName("pai");
                    pai.scale = 0.8;
                    pai.position = temp;
                    break;
                }
            }
        }
    },

    /**
     * 点击继续游戏按钮
     */
    onJixuClicked:function(){
        for(var i = 0; i < 4; i ++){
            this.pai_container.getChildByName("item" + i).getChildByName("pai").removeAllChildren();
            this.pai_container.getChildByName("item" + i).active = false;
        }
        if(this.resultData.game_status == 1){
            this.control.onJixuClicked();
        }else{
            if(this.isReplay){
                this.control.onJixuClicked();
                return;
            }
            this.node.active = false;
            this.control.showZhanji(this.resultData);
        }
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
            //icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-paibei_my_2");
            icon.spriteFrame = this.pai_atlas1.getSpriteFrame("paimian1-mydown_49");
        }else{
            //icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-mydown_" + pai);
            icon.spriteFrame = this.pai_atlas1.getSpriteFrame("paimian1-mydown_" + pai);
        }
    },

    onClickView: function () {
        //this.isShowing = true;
        //var bg = this.node;
        //bg.scale = 1;
        //bg.runAction(cc.sequence(
        //    cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
        //    cc.callFunc(function () {
                this.isShowing = false;
                this.node.active = false;
        //    }.bind(this))
        //));
    }
});
