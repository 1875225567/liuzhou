var BATTERY_MAX = 43; //电池最大宽度
var RULE_BEGIN_X = -635; //规则开始坐标
var RULE_END_X = -340; //规则结束坐标
var TOOL_BEGIN_X = 638; //工具开始坐标
var TOOL_END_X = 348; //工具结束坐标
var PLAYER_POS = [
    [cc.v2(0, -208), cc.v2(318, 0), cc.v2(0, 208), cc.v2(-318, 0)],
    [cc.v2(-580, -138), cc.v2(580, 138), cc.v2(400, 298), cc.v2(-580, 138)]
];

//最快速度1s
var MAX_SPEED = 30;
//最慢速度5s
var MIN_SPEED = 300;

/**
 * 游戏场景
 */
cc.Class({
    extends: cc.Component,

    properties: {
        pai_atlas:cc.SpriteAtlas,    //资源图集
        head_atlas:cc.SpriteAtlas,   //头像资源
        main_node: cc.Node,          //主体容器
        node_layer: cc.Node,         //子界面容器
        //ui相关**********************
        background: cc.Node,         //背景
        room_id_lab: cc.Label,       //房间号
        time_lab: cc.Label,          //时间
        waiting_layer: cc.Node,      //等待层
        msg_node: cc.Node,           //提示层
        game_layer:cc.Node,          //游戏玩家及牌面展示
        timer_layer:cc.Node,         //时间指示
        control_layer:cc.Node,       //控制
        chupai_prefab:cc.Prefab,     //出牌的预制
        select_special_pai:cc.Prefab,//选择操作的特殊牌预制
        special_maj_prefab:[cc.Prefab]
    },

    ctor: function () {
        this.isLoad = false;
        this.isShowing = false;
        this.auto_texture = [];   //需要自动释放的自动

        //语言触摸

        this.count = 0;
        this.isTouchDown = false;
        this.isKaiju = false;  //是否开局
        this.zhuang = null;

        this.maj_gang_space_arr = [85, 32, -50, -32];   //麻将碰杠牌的间隔
        this.maj_hand_begin_pos = [cc.v2(-620,-300),cc.v2(528,-104),cc.v2(308,261),cc.v2(-501,218)];     //手上牌麻将开始坐标        2/ 3/4人模式
        this.maj_out_begin_pos2 =   [cc.v2(-415,-85),cc.v2(415,90), cc.v2(415,90), cc.v2(49.1,112)];     //打出麻将开始坐标               2人模式
        this.maj_out_begin_pos =    [cc.v2(-200,-85),cc.v2(250,-140), cc.v2(200,90), cc.v2(-250,140)];   //打出麻将开始坐标                3/4人模式
        this.maj_out_buhua_begin_pos = [cc.v2(360,-200),cc.v2(450,100),cc.v2(-300,200),cc.v2(-450,-100)];   //玩家补花出的牌
        this.maj_out_space = [43,32,-43,-32];           //打出麻将间隔
        this.maj_out_row_space = [-50, 55, 50, -55];    //打出麻将二层间隔
        this.maj_hand_space_arr = [90, 27, -39, -27];   //手上牌的间隔
        this.maj_top_space_arr = [30, 50, 50, 50];      //出牌上升高度

        this.special_pai = [[],[],[],[]];    //存放4个玩家操作的数据
        this.special_arr = [[],[],[],[]];    //存放4个玩家碰杠牌
        this.maj_hand_pai = [[],[],[],[]];   //手上麻将数据
        this.maj_hand_arr = [[],[],[],[]];   //四组在手上的麻将
        this.maj_out_arr = [[],[],[],[]];    //四组打出来的麻将对象
        this.maj_out_pai = [0,0,0,0];        //四组打出来的麻将数量
        this.maj_prefab = [[],[],[],[]];     //四组麻将预制0打出的牌，1碰的牌，2明杠牌，3暗杠牌，4背景牌
        this.maj_buhua_arr = [[],[],[],[]];  //四组补花麻将对象

        this.current_da = 0;           //当前操作中谁打的牌
        this.current_type = 0;         //当前操作发来的类型
        this.handle_status = [];       //操作数组
        this.caozuo_tx_data = null;    //操作提醒的类型及数据信息
        this.current_dir = -1;         //当前出牌方向
        this.current_q = -1;           //当前起牌状态-1没有起牌1起到牌

        this.isCanTouch = false;         //当前是否可点击状态, 自己是庄家
        this.selectePai = 0;             //当前选择的牌类型
        this.huPai = 0;                  //胡的牌
        this.isSendPai = false;          //是否在出牌
        this.current_maj = null;         //当前选中的麻将对象

        this.game_status = 0;            //游戏状态0未开始游戏，1已开始游戏， 2结算游戏
        this.game_ren = 4;               //人数
        this.chat_layer = null;          //聊天
        this.gps_layer = null;           //gps
        this.voice_layer = null;         //语音
        this.hupaizhanji_layer = null;   //小局战绩
        this.zhanji_layer= null;         //zong局战绩
        this.vote_layer = null;
        this.roomInfo = null;
        this.userInfo = null;
        this.player_id_arr = [];          //用户id数组
        this.player_node_arr = [];        //用户头像节点数组（含聊天模块）

        this.replayData = null;
        this.progress = 0;        //当前进度
        this.step = 0;            //计数
        this.currentRate = 120;   //默认3秒执行一次抽取数据
        this.rate = 30;           //60帧1秒
        this.status = 1;          //当前状态0暂停1播放
    },

    onLoad: function () {
        this.isLoad = true;
        cc.gameReplayControl = this;
        if (this.main_node.loadType == true) {
            cc.loadingControl.loadingView(this.main_node, 'Game_replay_control');
        } else {
            cc.loadingControl.fadeOutMask(this.main_node, 'Game_replay_control');
        }
    },

    /**
     * 初始化游戏场景
     */
    onOpenView: function () {
        cc.vv.audioMgr.playBGM("bgm_game", "mp3");
        console.log(cc.vv.Global.replayData);

        this.replayData = cc.vv.Global.replayData.data;
        cc.log(this.replayData);
        this.max_len = this.replayData.length;
        //this.showCommonData(this.replayData[0].data);
        this.initView();
        this.onReturnKaiju(this.replayData[0].data);

        this.scheduleOnce(function () {
            this.progress = 1;
            //this.progress_view.active = true;
        }, 2.0000);

        //1秒后出现可操作的按钮
        this.scheduleOnce(function () {
            this.control_layer.active = true;
        }, 3.0000);
    },

    /**
     * 更新逻辑部分
     */
    update:function () {
        if(this.status == 0)return;
        if(this.progress <= 0)return;//从索引1开始抽取数据
        //开始抽取数据
        if((this.step % this.currentRate) == 0){
            this.getReplayData();
        }
        this.step++;
    },

    /**
     * 抽取数据
     */
    getReplayData:function () {
        cc.log("-----------------------------------------------------执行到了"+this.progress);
        var data = this.replayData[this.progress];
        cc.log(data);
        switch (data.route.toString()){
            case "zhuapai":
            {
                this.onReturnZhuapai(data.data);
                break;
            }
            case "dapai":
            {
                this.onReturnDapai(data.data);
                break;
            }
            case 'caozuo':
            {
                this.onReturnCaozuo(data.data);
                break;
            }
            case "hua":
            {
                this.onReturnHua(data.data);
                break;
            }
            case "hu":
            {
                this.progress = -10;        //结束数据抽取
                this.onReturnHu(data.data);
                break;
            }
        }
        this.progress++;
        //this.showProgress();
    },

    /**
     * 点击快进
     */
    onTouchFastBtn:function () {
        this.currentRate -= this.rate;
        this.checkSpeed();
    },

    /**
     * 点击减慢
     */
    onTouchSlowBtn:function () {
        this.currentRate += this.rate;
        this.checkSpeed();
    },

    /**
     * 检查速度
     */
    checkSpeed:function () {
        if(this.currentRate <= MAX_SPEED){
            this.currentRate = MAX_SPEED;
        }
        if(this.currentRate >= MIN_SPEED){
            this.currentRate = MIN_SPEED;
        }
    },

    onBackClicked:function(){
        this.onJixuClicked();
    },

    /**
     * 点击暂停
     */
    onTouchPlayOrPauseBtn:function () {
        this.control_layer.getChildByName("play").active = false;
        this.control_layer.getChildByName("pause").active = false;
        if(this.status==1){
            this.status = 0;
            this.control_layer.getChildByName("play").active = true;
        }else{
            this.status = 1;
            this.control_layer.getChildByName("pause").active = true;
        }
    },

    onDestroy: function () {
        cc.vv.Global.room_id = null;
        cc.vv.Global.club_id = null;
        this.unscheduleAllCallbacks();
        while (this.auto_texture.length) {
            let textur2D = this.auto_texture.shift();
            cc.loader.setAutoReleaseRecursively(textur2D, true);
        }
        cc.gameControl = null;
        console.log("执行了ondestroy");
        cc.loadingControl.game_scene = null;
        cc.loader.setAutoReleaseRecursively('Prefab/game_scene', true);
    },

    onJixuClicked:function(){
        this.special_pai = [[],[],[],[]];//存放4个玩家操作的数据
        this.special_arr = [[],[],[],[]];//存放4个玩家碰杠牌
        this.maj_hand_pai = [[],[],[],[]];//手上麻将数据
        this.maj_hand_arr = [[],[],[],[]];//四组在手上的麻将
        this.maj_out_arr = [[],[],[],[]];//四组打出来的麻将对象
        this.maj_out_pai = [0,0,0,0];//四组打出来的麻将数量
        this.maj_prefab = [[],[],[],[]];//四组麻将预制0打出的牌，1碰的牌，2明杠牌，3暗杠牌，4背景牌
        this.maj_buhua_arr = [[],[],[],[]];  //四组补花麻将对象
        this.control_layer.active = false;
        for(let i = 0; i < 4; i++){
            this.player_node_arr[i].getChildByName("outpai").removeAllChildren();
            this.player_node_arr[i].getChildByName("specialpai").removeAllChildren();
            this.game_layer.getChildByName("player"+i).active =false;
        }
        for(let i = 0; i < 4; i++){
            for(var h = 0; h < 14; h++){
               this.game_layer.getChildByName("player"+i).getChildByName("handpai").getChildByName("pai" + h).active = true;
            }
        }
        if(this.hupaizhanji_layer!=null){
            this.hupaizhanji_layer.active = false;
        }
        cc.vv.Global.replayData  = null;
        this.loadSceneByName('hall_scene');
        this.onDestroy();
    },

    /**
     * 消息提示
     * @msg
     */
    showMsg: function (msg) {
        this.msg_node.active = true;
        this.msg_node.stopAllActions();
        this.msg_node.position = cc.v2(0, -288);
        this.msg_node.opacity = 255;
        msg_node.getChildByName('lab').getComponent(cc.Label).string = msg;
        msg_node.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.moveBy(1, cc.v2(0, 100)),
            cc.spawn(
                cc.moveBy(1, cc.v2(0, 100)),
                cc.fadeOut(1)
            )
        ));
    },

    /**
     * 通用加载场景
     * @param sceneName
     */
    loadSceneByName: function (sceneName) {
        this.onClickView();
        this.main_node.opacity = 0;
        this.main_node.active = false; //隐藏该节点
        this.enabled = false; //十分重要，隐藏节点并中断节本执行
        cc.vv.audioMgr.playBGM("bgm_login" + cc.vv.userData.music_index, "mp3");
        cc.loadingControl.loadSceneByName(sceneName, true);
    },

    onClickView: function () {
        while (this.auto_texture.length) {
            let textur2D = this.auto_texture.shift();
            cc.loader.setAutoReleaseRecursively(textur2D, true);
        }
    },

    initView:function(){
        for(var i = 0; i < 4; i++){
            for(var h = 0; h < 14; h++){
                var maj_hand = this.game_layer.getChildByName("player"+i).getChildByName("handpai").getChildByName("pai" + h);
                this.maj_hand_arr[i].push(maj_hand);
            }
        }
    },

    /**************************************游戏场景下的消息接受*********************************************************/
    /**
     * 返回开具信息
     * @param data
     */
    onReturnKaiju:function(data){
        console.log("返回游戏方开局信息");
        console.log(data);
        this.isKaiju = true;
        this.zhuang = data.zhuang;
        this.player_id_arr = [];

        this.userInfo = cc.vv.Global.userInfo = data.users ;//玩家全部信息
        this.gameInfo = cc.vv.Global.roomInfo = data.roomInfo ;
        this.roomInfo = cc.vv.Global.roomInfo = data.roomInfo;//房间信息
        this.ju = parseInt(data.roomInfo.guize.jushu) - data.roomInfo.ju;
        this.room_id = cc.vv.Global.room_id = data.roomInfo.guize.room_id;
        this.weizhi  = data.weizhi;
        this.game_ren = parseInt(this.roomInfo.guize.renshu);

        this.game_layer.active = true;
        console.log(this.player_id_arr);
        this.player_node_arr = [];
        this.player_node_arr[0] = this.game_layer.getChildByName("player0");
        this.player_node_arr[1] = this.game_layer.getChildByName("player1");
        this.player_node_arr[2] = this.game_layer.getChildByName("player2");
        this.player_node_arr[3] = this.game_layer.getChildByName("player3");
        if(this.game_ren==2){
            this.player_node_arr[1] = this.game_layer.getChildByName("player2");
            this.game_layer.getChildByName("player2").active = true;
        }else if(this.game_ren==3){
            this.player_node_arr[1] = this.game_layer.getChildByName("player1");
            this.player_node_arr[2] = this.game_layer.getChildByName("player2");
            this.game_layer.getChildByName("player1").active = true;
            this.game_layer.getChildByName("player2").active = true;
        }else{
            this.player_node_arr[1] = this.game_layer.getChildByName("player1");
            this.player_node_arr[2] = this.game_layer.getChildByName("player2");
            this.player_node_arr[3] = this.game_layer.getChildByName("player3");
            this.game_layer.getChildByName("player1").active = true;
            this.game_layer.getChildByName("player2").active = true;
            this.game_layer.getChildByName("player3").active = true;
        }

        this.showUserInfo();//展示用户信息   158595912

        for(let i = 0; i < 4; i++){
            this.player_node_arr[i].getChildByName("handpai").active = true;
            this.player_node_arr[i].getChildByName("outpai").removeAllChildren();
        }
        this.maj_out_pai = [0,0,0,0];//重置打出的牌数据
        this.special_pai = [[],[],[],[]];//重置碰杠牌数据
        this.maj_buhua_arr = [[],[],[],[]];  //四组补花麻将对象
        this.maj_hand_pai = [[], [], [], []];
        this.timer_layer.getChildByName("pai_num").getChildByName("num").getComponent(cc.Label).string = data.pais_num
        this.timer_layer.getChildByName("ju_num").getChildByName("num").getComponent(cc.Label).string = this.ju;
        //自己的牌数据
        for(let i = 0 ; i < this.game_ren; i ++){
            var id = this.player_id_arr[i];
            if(id == 0 || id.toString() == "0"){
                continue;
            }
            var pai_arr = data.pais[id].s;
            pai_arr.sort(function(a,b){return a - b});//排序
            this.timer_layer.active = true;
            if(this.game_ren == 2 && i == 1){
                this.maj_hand_pai[2] = pai_arr;
                this.onShowHandPaiInfo(2, true);
            }else{
                this.maj_hand_pai[i] = pai_arr;
                this.onShowHandPaiInfo(i, true);
            }
        }
    },

    onReturnZhuapai:function(data){
        console.log("收到抓牌信息");
        console.log(data);
        this.timer_layer.getChildByName("pai_num").getChildByName("num").getComponent(cc.Label).string = data.pais_num;
        this.beginChupaiTimeOut();
        this.onShowTimeDir(data.mid);
        this.onShowQiPai(data);
    },

    /**
     * 返回打牌信息
     */
    onReturnDapai:function(data){
        this.onShowTimeDir(-1);
        this.beginChupaiTimeOut();
        this.clearOutPaiPointer();
        this.current_q = -1;
        var mid = data.mid;//出牌者
        var pai = data.pai;//牌

        var sex  = this.userInfo[data.mid].sex;   //获取到性别
        cc.vv.audioMgr.playSoundName(sex,0,pai);

        for(var i = 0; i < 4; i++){
            var id = this.player_id_arr[i];
            if(id.toString() == mid.toString()){
                if(this.game_ren==2&&i==1){
                    this.doChuPaiInHandPai(2, pai, mid);
                }else{
                    this.doChuPaiInHandPai(i, pai, mid);
                }
                break;
            }
        }
    },

    /***
     *吃碰杠  返回操作信息
     * @param data
     */
    onReturnCaozuo:function(data){
        cc.log(data);
        this.isCanTouch = true;
        //this.beginChupaiTimeOut();
        var da = data.da_mid;//打出牌的人
        var mid = data.mid;//碰杠操作的人
        var pai = data.pai;//要处理的牌
        var chi = data.chi;//吃的牌
        var status = data.status;//1.吃 2碰 3杠
        var type = data.type;//(gang的时候参考  1明杠、2暗杠、3补杠、4痞子癞子gang)
        var dir = -1;
        for(var i = 0; i < 4; i++){
            var id = this.player_id_arr[i];
            if(id.toString() == mid.toString()){
                if(this.game_ren == 2 && i == 1){
                    dir = 2;
                }else{
                    dir = i;
                }
                break;
            }
        }
        var sex = this.userInfo[data.mid].sex;
        if(status == 1){
            cc.vv.audioMgr.playSoundName(sex,"chi",pai);
        }else if(status == 2){
            cc.vv.audioMgr.playSoundName(sex,"peng",pai);  //lris
        }else if(status == 3){
            cc.vv.audioMgr.playSoundName(sex,"gang",pai);
        }

        this.onShowTimeDir(data.mid);
        this.showCaozuoAnimation(status,dir);

        var type_ziji = da == mid ? 0 : 1;   //0自摸，1别人的
        if(da.toString() == ""){
            type_ziji = 0;
        }

        var user = this.userInfo[mid];
        var da_dir = 0;
        for(let i = 0; i < this.player_id_arr.length; i++){
            let id = this.player_id_arr[i];
            if(type_ziji.toString() == "1" && id.toString() == da.toString()){
                if(this.game_ren == 2 && i == 1){
                    da_dir = 2;
                }else{
                    da_dir = i;
                }
            }
        }
        console.log("type="+type.toString());
        console.log("type_ziji="+type_ziji.toString());
        this.onShowPengGangPai(this.current_dir, pai, status, type_ziji, da, da_dir, chi);
    },

    setPaiUntouched:function(pai){
        console.log("执行了不能操作的牌是="+pai);
        for(var i = 0; i < this.maj_hand_pai[0].length; i++){
            var maj_arr = this.maj_hand_arr[0];//手上的牌对象
            var pai_arr = this.maj_hand_pai[0];//手上的牌数据
            if(pai.toString() == pai_arr[i].toString()){
                console.log("执行了让牌不能出事件");
                var maj_js = maj_arr[i].getComponent("maj_control");
                maj_js.setEnable(false)
            }
        }
    },

    onReturnHua:function(data){
        console.log(data);
        var dir = -1;
        console.log(this.player_id_arr);
        for(var i = 0; i < this.player_id_arr.length; i++){
            var id = this.player_id_arr[i];
            if(id.toString() == data.mid.toString()){
                if(this.game_ren == 2 && i == 1){
                    dir = 2;
                }else{
                    dir = i;
                }
            }
        }
        this.maj_buhua_arr[dir].push(data.hua);
        this.showBuhua(dir);
        console.log(this.maj_buhua_arr);
    },

    /**
     * 展示补花的牌
     */
    showBuhua:function(dir){
        if(this.maj_buhua_arr[dir].length != 0){
            this.player_node_arr[dir].getChildByName("buhua_pai").removeAllChildren();
            this.player_node_arr[dir].getChildByName("buhua_pai").active = true;
            var buhua_arr = this.maj_buhua_arr[dir];                //桌面上的牌对象
            console.log(buhua_arr);
            for(let j = 0; j < buhua_arr.length; j++){
                this.onShowHandPaiInfo(dir);
                var buhua_pai = cc.instantiate(this.chupai_prefab);
                var x = this.maj_out_buhua_begin_pos[dir].x;
                var y = this.maj_out_buhua_begin_pos[dir].y;
                if(dir == 0 || dir == 2){
                    buhua_pai.scale = 0.8;
                    x += j * this.maj_out_space[dir];
                }else{
                    buhua_pai.scale = 1.2;
                    y += j * this.maj_out_space[dir];
                    if(dir == 1){
                        buhua_pai.zIndex = 4 - j;
                    }
                }
                buhua_pai.position = cc.v2(x,y);
                console.log(cc.v2(x,y));
                buhua_pai.parent = this.player_node_arr[dir].getChildByName("buhua_pai");
                buhua_pai.active = true;
                if(dir == 0 || dir == 2){
                    this.showMajIcon(buhua_pai, buhua_arr[j], 2);
                }else{
                    this.showMajIcon(buhua_pai, buhua_arr[j], dir);
                }
            }
        }
    },

    /**
     * 展示胡牌效果
     * @param data
     */
    onReturnHu:function(data){
        if(data.hu_mid.length > 0){
            var sex = this.userInfo[data.hu_mid[0]].sex;
            cc.vv.audioMgr.playSoundName(sex,"hu","");
        }
        var isMine = false;
        for(var t = 0; t < data.hu_mid.length; t++){
            var dir = -1;
            if(data.hu_mid[t].toString()==cc.vv.userData.mid.toString()){
                isMine = true;
            }
            for(var i = 0; i < 4; i++){
                var id = this.player_id_arr[i];
                if(id.toString() == data.hu_mid[t].toString()){
                    if(this.game_ren == 2 && i == 1){
                        dir = 2;
                    }else{
                        dir = i;
                    }
                    break;
                }
            }
            if(dir != -1){
                this.showCaozuoAnimation(4,dir);
            }
        }
        //展示胡牌信息
        this.scheduleOnce(function () {
            if(isMine){
                cc.vv.audioMgr.playSFX('win', 'mp3');
            }else{
                cc.vv.audioMgr.playSFX('lost', 'mp3');
            }
            if (this.hupaizhanji_layer == null) {
                this.waiting_layer.active = true;
                var self = this;
                cc.loader.loadRes('Prefab/game/hupaizhanji_layer', function (err, prefab) {
                    self.hupaizhanji_layer = cc.instantiate(prefab);
                    self.hupaizhanji_layer.parent = self.node_layer;
                    self.hupaizhanji_layer.getComponent('hupaizhanji_layer').onOpenView(data);
                    self.waiting_layer.active = false;
                });
            } else {
                this.hupaizhanji_layer.active = true;
                this.hupaizhanji_layer.getComponent('hupaizhanji_layer').onOpenView(data);
            }
        }.bind(this), 2);
    },

    /**
     * 显示某个方向所有的出牌内容
     */
    onShowAllChuPai:function(dir, data){
        var len = data.length;
        this.maj_out_pai[dir] = len;                    //每位玩家打出拍数量
        console.log(this.maj_out_pai);
        var out_arr = this.maj_out_arr[dir];                //桌面上的牌对象
        for(var i = 0; i < len; i++){
            var out_pai = cc.instantiate(this.chupai_prefab);   //出的牌
            out_arr.push(out_pai);
            if(dir == 0 || dir == 2){
                out_pai.scale = 0.8;
            }else{
                out_pai.scale = 1.2;
            }
            out_pai.position = this.getOutPaiPosByIndex(dir,i);
            out_pai.parent = this.player_node_arr[dir].getChildByName("outpai");
            out_pai.zIndex = this.getOutPaiZindexByIndex(dir,i);
            if(dir == 0 || dir == 2){
                this.showMajIcon(out_pai, data[i],2);
            }else{
                this.showMajIcon(out_pai, data[i],dir);
            }
        }
    },

    /**
     * 六局打完  展示战绩
     */
    showZhanji:function(data){
        if (this.zhanji_layer == null) {
            this.waiting_layer.active = true;
            var self = this;
            cc.loader.loadRes('Prefab/game/gamezhanji_layer', function (err, prefab) {
                self.zhanji_layer = cc.instantiate(prefab);
                self.zhanji_layer.parent = self.node_layer;
                console.log(self.zhanji_layer);
                self.zhanji_layer.getComponent("gamezhanji_layer").onOpenView(data);
                self.waiting_layer.active = false;
            });
        } else {
            this.zhanji_layer.active = true;
            this.zhanji_layer.getComponent("gamezhanji_layer").onOpenView(data);
        }
    },

    /**
     * 处理自摸或者碰杠别人的牌
     * status   1chi   2peng   3gang
     * type     1别人   0 自己
     * */
    onShowPengGangPai:function (dir, pai, status, type, da, da_dir,chi) {
        var special_data_arr = this.special_pai[dir];//手上的碰杠牌数据
        var isCreate = false, change_index = 0, count = 0;

        if(status.toString() == "1") {          //吃
            change_index = special_data_arr.length;
            for(let i = 0;i < 3; i++){
                if(pai.toString()!=chi[i].toString()){
                    this.onSpliceHandPai(dir, chi[i], 1, change_index);
                }
            }
            isCreate = true;
            special_data_arr.push({status:status, pai:chi, gang:0,dir:da_dir});
            cc.log("执行了创建吃拍操作");
            this.isCanTouch = true;
        }else if(status.toString() == "2"){     //碰
            special_data_arr.push({status:status, pai:[pai,pai,pai], gang:0,dir:da_dir});
            isCreate = true;//需要创建牌
            change_index = special_data_arr.length-1;
            count = 2;      //删除的手牌
            this.isCanTouch = true;
        }else if(status.toString() == "3"){     //杠
            //杠
            cc.log("type="+type);
            cc.log("type.toString()="+type.toString());
            if(type.toString() == "0"){
                //自摸明杠
                var len = special_data_arr.length;
                var isZiMo = false;//有碰，自摸杠
                cc.log("pai="+pai.toString());
                for(let i = 0; i < len; i++){
                    var obj = special_data_arr[i];
                    cc.log(obj.pai.toString());
                    if(obj.pai[0].toString() == pai.toString()){

                        isZiMo = true;
                        obj.status = status;
                        obj.dir =da_dir;
                        //修改原有的牌
                        isCreate = false;
                        change_index = i;
                        count = 1;
                        cc.log("碰变杠执行");
                        break;
                    }
                }
                //自摸暗杠
                if(isZiMo == false){
                    special_data_arr.push({status:status, pai:[pai,pai,pai,pai], gang:1,dir:-1});
                    isCreate = true;//创建新的
                    change_index = special_data_arr.length-1;
                    count = 4;
                }
            }else{
                let len = special_data_arr.length;
                var isBugang = false;
                for(let i = 0; i < len; i++){
                    let obj = special_data_arr[i];
                    cc.log(obj.pai.toString());
                    if(obj.pai[0].toString() == pai.toString()){    //遍历特殊牌 看是否相同
                        isBugang = true;
                        obj.status = status;
                        obj.dir =da_dir;
                        //修改原有的牌
                        isCreate = false;
                        change_index = i;
                        count = 1;
                        cc.log("碰变杠执行");
                        break;
                    }
                }
                if(isBugang==false){        //不是补杠
                    special_data_arr.push({status:status, pai:[pai,pai,pai,pai], gang:0,dir:da_dir});
                    isCreate = true;
                    change_index = special_data_arr.length-1;
                    count = 3;
                }
            }
        }
        //先删除手上的牌数据
        if(status.toString() != "1"){
            this.onSpliceHandPai(dir, pai, count, change_index);
        }
        //吃别人打的牌(清除别人出牌区的碰杠牌)
        if(type.toString() == "1"){
            this.onCleanDeskTopPai(da_dir, dir, change_index,isCreate);
        }

        //创建吃碰杠牌
        this.scheduleOnce(function (dir,change_index,isCreate) {
            this.onCreateSpecialPai(dir,change_index,isCreate, true);
            this.onShowHandPaiInfo(dir, false);
        }.bind(this, dir, change_index, isCreate), 0.3);
    },

    /**
     * 清除桌面上的牌
     */
    onCleanDeskTopPai:function (dir, current_dir, change_index) {
        var out_arr = this.maj_out_arr[dir];//桌面上的牌对象
        var space = this.maj_hand_space_arr[current_dir];
        var begin = this.getSpecialPaiPosByIndex(current_dir,change_index);
        //最后打出的一个牌
        var len = this.maj_out_pai[dir];
        var maj = out_arr[len-1];
        this.maj_out_pai[dir]--;
        out_arr.splice(len-1,1);
        maj.active = false;
        maj.destroy();
        console.log("执行了移除出牌")
    },

    /**
     * 删除手上的牌数据
     */
    onSpliceHandPai:function (dir, pai, count, change_index) {
        var maj_arr = this.maj_hand_arr[dir];//手上的牌对象
        var pai_arr = this.maj_hand_pai[dir];//手上的牌数据
        var top_space = this.maj_top_space_arr[dir];
        var space = this.maj_hand_space_arr[dir];
        var begin = this.getSpecialPaiPosByIndex(dir,change_index);//开始坐标
        var index = 0;
        var temp = [];
        var temp_maj = [];

        var len = pai_arr.length;
        for(var i = 0; i < len; i++){
            var type = pai_arr[i];
            if(type.toString() == pai.toString() && index < count){
                //处理要碰杠掉的牌，扣除的数量
                var maj = maj_arr[i];
                temp_maj.push(maj);
                var action1 = cc.moveBy(0.1, cc.v2(0, top_space));
                var action2 = cc.moveTo(0.2, begin);
                var action3 = cc.callFunc(function () {
                    this.opacity = 0;
                }.bind(maj));
                maj.runAction(action1,action2,action3);
                if(dir == 1 || dir == 3){
                    begin.y += space;
                }else{
                    begin.x += space;
                }
                index++;
            }else{
                temp.push(type.toString());//保存要留下的牌
            }
        }
        this.maj_hand_pai[dir] = temp;//新的手上牌数据
        while (temp_maj.length){
            let maj = temp_maj.shift();
            let _index = maj_arr.indexOf(maj);
            maj_arr.splice(_index, 1);
            maj_arr.push(maj);
            maj.pai = 0;
        }
    },

    /**
     * 创建或改变碰杠牌
     */
    onCreateSpecialPai:function (dir, change_index, isCreate, hasSound) {
        var special_data_arr = this.special_pai[dir];//手上的碰杠牌数据
        var special_maj_arr = this.special_arr[dir];//手上的碰杠牌对象
        var maj_prefab = this.special_maj_prefab[dir];//麻将预制组
        var pos = this.getHandlePaiPos(dir, change_index);//开始坐标
        var space = this.maj_gang_space_arr[dir];//麻将手上牌的间隔
        var container = this.player_node_arr[dir].getChildByName("specialpai");//麻将放的节点
        var obj = special_data_arr[change_index];//碰杠牌数据

        var d = obj.dir;
        cc.log(change_index);
        cc.log("d="+d);
        cc.log(d);
        cc.log(pos);
        if (isCreate == true) {
            var special_maj;
            var temp = cc.v2(pos.x, pos.y);
            special_maj = cc.instantiate(maj_prefab);
            if(obj.status.toString() == "1"){
                for (let i = 0; i < 3; i++) {
                    let pai = special_maj.getChildByName("pai"+i);
                    if(dir==0){
                        this.showMajIcon(pai, obj.pai[i],2);
                    }else{
                        this.showMajIcon(pai, obj.pai[i],dir);
                    }
                }
            }else if(obj.status.toString()=="2"){
                for (let i = 0; i < 3; i++) {
                    let pai = special_maj.getChildByName("pai"+i);
                    if(dir==0){
                        this.showMajIcon(pai, obj.pai[i],2);
                    }else{
                        this.showMajIcon(pai, obj.pai[i],dir);
                    }
                }
            }else if(obj.status.toString()=="3") {
                console.log("执行了创建杠牌操作");

                special_maj.getChildByName("pai3").active = true;
                console.log(obj);
                if(obj.gang==1){
                    for (let i = 0; i < 4; i++) {
                        let pai = special_maj.getChildByName("pai"+i);
                        if(dir==0){
                            if(i==3){
                                this.showMajIcon(pai, obj.pai[i],2);
                            }else{
                                this.showMajIcon(pai, -1,2);
                            }
                        }else{
                            this.showMajIcon(pai, -1,dir);
                        }
                    }
                }else{
                    for (let i = 0; i < 4; i++) {
                        let pai = special_maj.getChildByName("pai"+i);
                        if(dir==0){
                            this.showMajIcon(pai, obj.pai[i],2);
                        }else{
                            this.showMajIcon(pai, obj.pai[i],dir);
                        }
                    }
                }
            }
            special_maj.parent = container;
            special_maj.position = temp;
            cc.log(special_maj.position);
            special_maj_arr.push(special_maj);
            if (dir == 1 || dir == 3) {
                temp.y += space;
            } else {
                temp.x += space;
            }
        }else{
            cc.log("执行了碰变杠牌面渲染操作");
            var index = change_index;
            var maj = special_maj_arr[index];
            console.log(special_maj_arr);
            console.log(maj);
            maj.getChildByName("pai3").active = true;
            if(dir==0){
                this.showMajIcon(maj.getChildByName("pai3"), obj.pai[0],2);
            }else{
                this.showMajIcon(maj.getChildByName("pai3"), obj.pai[0],dir);
            }
            cc.log("这很严重");
        }
    },

    /**获取碰杠牌位置 */
    getHandlePaiPos:function(dir, index){
        var pos = this.maj_hand_begin_pos[dir];//开始坐标
        var space = this.maj_gang_space_arr[dir];//间隔
        var begin = cc.v2(pos.x, pos.y);
        //有碰杠牌
        if(dir == 1 || dir ==3){
            begin.y += index * 3 * space;
        }else{
            begin.x += index * 3 * space;
        }
        return begin;
    },

    /**
     * 展示操作动画
     * @param type  操作类型
     * @param dir   方向
     */
    showCaozuoAnimation:function(type,dir){     //0过,1碰,2吃,3胡,4喂(扫),5提,6舵
        var animationName = "";
        var skeletonData = "";
        switch(type.toString()){
            case "1":{
                animationName = "chi";
                skeletonData = "chipenggang_ani/chipeng";
                break;
            }
            case "2":{
                animationName = "peng";
                skeletonData = "chipenggang_ani/chipeng";
                break;
            }
            case "3":{
                animationName = "gang";
                skeletonData = "chipenggang_ani/chipeng";
                break;
            }
            case "4":{
                animationName = "animation";
                skeletonData = "hu_ani/huuhx1";
                break;
            }
        }
        console.log(this.player_node_arr);
        console.log("dir="+dir);
        cc.loader.loadRes("spine/"+skeletonData/*+".json"*/, sp.SkeletonData, function (err, spData) {
            console.log(this.player_node_arr);
            console.log("dir="+dir);
            var emoji_view = this.player_node_arr[dir].getChildByName("caozuo");
            emoji_view.active = true;
            var emoji = emoji_view.getComponent(sp.Skeleton);
            emoji.skeletonData = spData;
            emoji.clearTrack(0);
            emoji.setAnimation(0,animationName,true);
        }.bind(this));

        setTimeout(function () {
            cc.log("执行了1.5秒后取消caozuo界面");
            this.player_node_arr[dir].getChildByName("caozuo").active = false;
        }.bind(this), 1500);
    },

    /**
     *随操作按钮同时牌面上升
     */
    showCaozuoPai:function(){
        var risePai = [];
    },

    /**点击了操作按钮*/
    onHandlerBtnClicked:function(event,type){    //0过   1234吃碰杠胡
        switch(type.toString()){
            case "0":{
                this.guoClicked();
                break;
            }
            case "1":{
                this.chiClicked();
                break;
            }
            case "2":{
                this.pengClicked();
                break;
            }
            case "3":{
                this.gangClicked();
                break;
            }
            case "4":{
                this.huClicked();
                break;
            }
        }
    },
    clearOutPaiPointer:function(){
        for(var i = 0; i < 4; i++){
            var out_arr = this.maj_out_arr[i];
            var out_pai = this.maj_out_pai[i];
            for(var j = 0; j < out_pai; j++){
                var out = out_arr[j];
                out.getChildByName("pointer").stopAllActions ();
                out.getChildByName("pointer").active = false;
            }
        }
    },

    doChuPaiInHandPai:function(dir, pai, mid){

        console.log( this.maj_hand_pai)
        console.log( this.maj_hand_arr)

        var pai_arr = this.maj_hand_pai[dir];//手上的牌数据
        var maj_arr = this.maj_hand_arr[dir];//手上的牌对象
        var index = 0;//出牌的索引
        for(var i = 0 ; i < pai_arr.length;i++ ){
            if(pai.toString()==pai_arr[i].toString()){
                index = i;
                break;
            }
        }
        var maj = maj_arr[index];//要出的牌
        console.log(maj)
        //创建打出的牌
        this.maj_out_pai[dir]++;
        var out_arr = this.maj_out_arr[dir];                //桌面上的牌对象
        var out_len = this.maj_out_pai[dir];
        var out_pai = cc.instantiate(this.chupai_prefab);   //出的牌
        out_arr.push(out_pai);
        if(dir==0||dir==2){
            out_pai.scale = 0.8;
        }else{
            out_pai.scale = 1.2;
        }
        out_pai.position = this.getOutPaiPosByIndex(dir,out_len-1);
        out_pai.parent = this.player_node_arr[dir].getChildByName("outpai");
        out_pai.zIndex = this.getOutPaiZindexByIndex(dir,out_len-1);
        if(dir == 0 || dir == 2){
            this.showMajIcon(out_pai, pai,2);
        }else{
            this.showMajIcon(out_pai, pai,dir);
        }
        out_pai.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(function () {
                this.opacity = 255;
            }.bind(out_pai)),
            cc.callFunc(function () {
                var dian = this.getChildByName("pointer");
                dian.active = true;
                dian.runAction(cc.sequence(
                    cc.jumpBy(200,cc.v2(0,0),20,500),
                    cc.callFunc(function () {
                        this.active = false;
                    }.bind(dian))
                ))
            }.bind(out_pai))
        ));

        pai_arr.splice(index,1);//删除手中的牌
        pai_arr.sort(function(a,b){return a-b});//排序

        maj_arr.splice(index,1);//删除手中的麻将
        maj_arr.push(maj);//放入数组尾部
        maj.pai = 0;
        this.scheduleOnce(function (dir) {
            this.onShowHandPaiInfo(dir, false);
        }.bind(this, dir), 0.1);
    },

    /**
     * 获取出牌的层级坐标
     */
    getOutPaiZindexByIndex:function(dir,index){
        var zIndex = 1;
        if(dir ==0||dir==3){
            zIndex+=index;
        }else if(dir == 2||dir==1){
            zIndex = 100 -index;
        }
        return zIndex;
    },

    /**
     * 获取打出牌的位置
     */
    getOutPaiPosByIndex:function (dir, index) {
        var row_num = 10;
        if(this.game_ren==2){
            row_num = 20
        }
        var pos = null;
        if(this.game_ren==2){
            pos = this.maj_out_begin_pos2[dir];
        }else{
            pos = this.maj_out_begin_pos[dir];
        }

        var space = this.maj_out_space[dir];
        var row_space = this.maj_out_row_space[dir];
        var begin = cc.v2(pos.x, pos.y);
        var i = index%row_num;
        if(dir == 1 || dir == 3){
            begin.y += i*space;
        }else{
            begin.x += i*space;
        }
        if(index >= row_num){
            if(dir == 1 || dir == 3){
                begin.x += Math.floor(index/row_num)*row_space;
            }else{
                begin.y += Math.floor(index/row_num)*row_space;
            }
        }
        return begin;
    },

    /**
     * 打出牌
     */
    onCheckChuPai:function(maj){
        console.log("检查出牌: " + maj.pai + " 索引: " + maj.index);
        if(this.checkCanChuPai(maj) == true){
            if(this.handle_status.length != 0){//you碰杠胡提示操作时候滑动出牌  不坐处理
                this.onTouchHandleBtn(null,0); //点击过处理了
            }else{
                this.isSendPai = true;
                this.send_index = maj.index;
                cc.vv.WebSocket.sendWS("GameController", "dapai", {
                    "mid": cc.vv.userData.mid,
                    'room_id': cc.vv.Global.room_id, //俱乐部id
                    'pai':maj.pai
                });
            }
        }else{
            this.onTouchMaj(maj, true);
        }
    },

    /**
     * 判断是否可以出牌
     */
    checkCanChuPai:function (maj) {
        //("判断是否可以出牌checkCanChuPai")
        console.log("this.isSendPai="+this.isSendPai);
        console.log("this.current_dir="+this.current_dir);
        console.log("this.isCanTouch="+this.isCanTouch);
        if(this.isCanTouch == true  && this.isSendPai == false && this.current_dir == 0 && maj==this.current_maj && maj.pai != 0){
            return true;
        }
        return false;
    },

    /**
     * 触摸到麻将
     */
    onTouchMaj:function (maj, focus) {
        if(focus == true){
            this.current_maj = maj;
        }else{
            if(this.current_maj != maj){
                this.current_maj = maj;
            }else{
                return;
            }
        }
        var arr = this.maj_hand_arr[0];
        var maj_pai = this.maj_hand_pai[0];
        var space = this.maj_hand_space_arr[0];
        var pos = this.getHandPaiPosByIndex(0, 0);
        for(var i = 0; i < 14; i++){
            var m = arr[i];
            var maj_js = m.getComponent("maj_control");
            if(maj == null || m != maj){
                m.y = maj_js.begin_y;
                maj_js.isChecking = false;
            }else{
                m.y = maj_js.max_y;
                this.onTouchPaiFun(m);
            }
            if(i > 0){
                pos.x += space;
                if(this.current_dir == 0 && i == maj_pai.length - 1 && this.current_q != -1 && this.handle_status.length == 0){
                    pos.x += space*0.5;
                }
            }
            m.x = pos.x;
        }
    },

    /**
     * 点击牌处理
     */
    onTouchPaiFun:function(maj){
        //桌面麻将判断是否打出过
        for(var i = 0; i < 4; i++){
            var out_arr = this.maj_out_arr[i];
            var out_pai = this.maj_out_pai[i];
            for(var j = 0; j < out_pai; j++){
                var out = out_arr[j];
                if(maj && out.pai.toString() == maj.pai.toString()){
                    out.color = cc.color(120,120,120)
                }else{
                    out.color = cc.color(255,255,255)
                }
            }
        }
    },

    /**
     * 显示起牌
     */
    onShowQiPai:function (data) {
        var len = 0;
        var maj_pai = this.maj_hand_pai[this.current_dir];
        this.current_q = data.pai;
        maj_pai.push(data.pai);
        len = maj_pai.length;

        var pos = this.getHandPaiPosByIndex(this.current_dir, len-1);
        var space = this.maj_hand_space_arr[this.current_dir];
        var maj_arr = this.maj_hand_arr[this.current_dir];

        var maj = maj_arr[len-1];
        maj.opacity = 255;
        maj.index = len-1;
        if(this.current_dir == 1 || this.current_dir == 3){
            pos.y += space;
        }else{
            pos.x += space*0.5;
        }
        this.showMajIcon(maj, this.current_q,this.current_dir);
        maj.position = pos;
    },

    /**
     * 显示指定出牌人
     */
    onShowTimeDir:function(mid){
        for(var i = 0; i <this.player_id_arr.length; i++){
            var id = this.player_id_arr[i];
            if(mid.toString() == id.toString()){
                if(this.game_ren==2&&i==1){
                    this.current_dir = 2;
                    this.timer_layer.getChildByName("time2").active = true;
                }else{
                    this.current_dir = i;
                    this.timer_layer.getChildByName("time"+i).active = true;
                }
            }else{
                if(this.game_ren==2&&i==1){
                    this.timer_layer.getChildByName("time2").active = false;
                }else{
                    this.timer_layer.getChildByName("time"+i).active = false;
                }
            }
        }
    },

    /**
     * 开始出牌倒计时
     */
    beginChupaiTimeOut:function(){
        this.unschedule(this.updateChupaiTime);
        this.count = 15;
        console.log(this.timer_layer);
        this.timer_layer.getChildByName("time").getComponent(cc.Label).string = this.count;
        this.schedule(this.updateChupaiTime, 1);
    },

    /**
     * 更新出牌倒计时
     */
    updateChupaiTime:function(){
        this.count--;
        if(this.count < 0){
            this.unschedule(this.updateChupaiTime);
            this.count = 0;
            this.timer_layer.getChildByName("time").getComponent(cc.Label).string  = this.count;
        }else{
            this.timer_layer.getChildByName("time").getComponent(cc.Label).string  = this.count;
        }
    },

    /**
     * 初始化牌的信息显示
     */
    onShowHandPaiInfo:function(dir){
        var pos = this.getHandPaiPosByIndex(dir,0);
        var space = this.maj_hand_space_arr[dir];
        var maj_arr = this.maj_hand_arr[dir];
        var maj_pai = this.maj_hand_pai[dir];
        var len = maj_pai.length;
        for(var i = 0; i < 14; i++){
            var maj = maj_arr[i];
            maj.active = true;
            maj.index = i;
            maj.opacity = i >= len ? 0 : 255;
            var pai = i >= len ? 0 : maj_pai[i];
            this.showMajIcon(maj,pai,dir);
            if(i > 0){
                if(dir == 1 || dir == 3){
                    pos.y += space;
                    if(this.current_dir == dir && this.current_q != -1 && i == len-1){
                        pos.y += space;
                    }
                }else{
                    pos.x += space;
                    if(this.current_dir == dir && this.current_q != -1 && i == len-1){
                        pos.x += 0.5*space;
                    }
                    if(dir == 0 && i > len-1){
                        pos.x += 5*space;
                    }
                }
            }
            maj.position = pos;
        }
        this.showPaiZIndex(dir);
    },

    /**
     * 设置牌的层次
     */
    showPaiZIndex:function (dir) {
        var z = 0;
        //处理碰杠牌层次
        if(dir == 1 || dir == 3) {
            var special_arr = this.special_arr[dir];
            var maj;
            console.log(special_arr);
            for (let i = 0; i < special_arr.length; i++) {
                maj = special_arr[i];
                console.log(maj);
                maj.zIndex = z;
                if (dir == 1) {
                    z--;
                } else {
                    z++;
                }
            }
            var maj_arr = this.maj_hand_arr[dir];
            for (let i = 0; i < 14; i++) {
                maj = maj_arr[i];
                maj.zIndex = z;
                if (dir == 1) {
                    z--;
                } else {
                    z++;
                }
            }
        }
    },

    /**
     * 展示牌面（手牌，桌面拍，吃碰杠牌）
     * @param maj 节点
     * @param pai 牌面数据
     * @param dir 牌角度   0自己手牌
     *                      1右家的桌面牌（吃碰杠牌）
     *                      2自己和对家的桌面牌（吃碰杠拍）
     *                      3左家的桌面牌（吃碰杠牌）
     */
    showMajIcon:function(maj, pai, dir){
        maj.pai = pai;
        var icon = maj.getComponent(cc.Sprite);
        if(pai == -1){
            if(dir == 0){
                icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-paibei_my_2");
            }else if(dir == 1){
                icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-paibei_right_2");
            }else if(dir == 2){
                icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-paibei_my_2");
            }else if(dir == 3){
                icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-paibei_right_2");
            }
            return;
        }
        if(dir == 0){
            icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-my_" + pai);
        }else if(dir == 1){
            icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-right_" + pai);
        }else if(dir == 2){
            icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-mydown_" + pai);
        }else if(dir == 3){
            icon.spriteFrame = this.pai_atlas.getSpriteFrame("paimian-left_" + pai);
        }
    },

    /**
     * 获取手上牌位置
     */
    getHandPaiPosByIndex:function (dir, index) {
        var space = this.maj_hand_space_arr[dir];
        var special_arr = this.special_pai[dir];
        var len = special_arr.length;
        var pos = this.getSpecialPaiPosByIndex(dir, len);
        if(len > 0){
            if(dir == 1 || dir == 3){
                if(dir == 1){
                    pos.y += space;
                }else{
                    pos.y += 0.5*space;
                }
            }else{
                if(dir == 0){
                    pos.x += 20;
                }else{
                    pos.x += 0.5*space;
                }
            }
        }
        if(dir == 1 || dir == 3){
            pos.y += index*space;
        }else{
            pos.x += index*space;
        }
        return pos;
    },

    /**
     * 获取碰杠牌位置
     */
    getSpecialPaiPosByIndex:function (dir, index) {
        var pos = this.maj_hand_begin_pos[dir];
        var space = this.maj_gang_space_arr[dir];
        var begin = cc.v2(pos.x, pos.y);
        if(dir == 1 || dir == 3){
            begin.y += index * 3 * space;
        }else{
            begin.x += index * 3 * space;
        }
        return begin;
    },

    /**
     * 处理头像显示
     */
    showUserInfo:function(){
        this.changePlayerId();
        this.loadHeadInfo(true);
    },

    /**
     * 改变玩家头像位置
     */
    changePlayerId:function () {
        cc.log("展示当前的用户信息");
        var index  = -1;
        console.log(this.roomInfo);
        console.log(this.weizhi);
        for(let i = 0; i < parseInt(this.roomInfo.guize.renshu); i++){
            var id = this.weizhi[i+1];
            if(id.toString() == cc.vv.userData.mid.toString()){
                index = i;
                break;
            }
        }
        var num = parseInt(this.roomInfo.guize.renshu);

        cc.log(this.weizhi);
        if(index == -1){      //自己不再位置列表中   --  查看他人战绩
            for(let i = 0; i < num; i++){
                this.player_id_arr[i] = this.weizhi[i + 1];
            }
        }else{              //自己在列表中
            this.player_id_arr[0] = cc.vv.userData.mid;
            if(num == 2){
                if(index == 0){
                    this.player_id_arr[1] = this.weizhi[2];
                }else if(index == 1){
                    this.player_id_arr[1] = this.weizhi[1];
                }
            }
            if(num == 3){
                if(index == 0){
                    this.player_id_arr[1] = this.weizhi[2];
                    this.player_id_arr[2] = this.weizhi[3];
                }else if(index == 1){
                    this.player_id_arr[2] = this.weizhi[1];
                    this.player_id_arr[1] = this.weizhi[3];
                }else if(index == 2){
                    this.player_id_arr[1] = this.weizhi[1];
                    this.player_id_arr[2] = this.weizhi[2];
                }
            }
            if(num == 4){
                if(index == 0){
                    this.player_id_arr[1] = this.weizhi[2];
                    this.player_id_arr[2] = this.weizhi[3];
                    this.player_id_arr[3] = this.weizhi[4];
                }else if(index == 1){
                    this.player_id_arr[3] = this.weizhi[1];
                    this.player_id_arr[1] = this.weizhi[3];
                    this.player_id_arr[2] = this.weizhi[4];
                }else if(index == 2){
                    this.player_id_arr[1] = this.weizhi[4];
                    this.player_id_arr[2] = this.weizhi[1];
                    this.player_id_arr[3] = this.weizhi[2];
                } else if(index == 3){
                    this.player_id_arr[1] = this.weizhi[1];
                    this.player_id_arr[2] = this.weizhi[2];
                    this.player_id_arr[3] = this.weizhi[3];
                }
            }
        }
        cc.log( this.player_id_arr)
    },

    /**
     * 加载头像信息 isShow是否强制不显示状态图
     */
    loadHeadInfo:function (isShow) {
        console.log(this.player_id_arr);
        console.log(this.player_node_arr);

        for(var i = 0; i < this.player_id_arr.length; i++){
            let id = this.player_id_arr[i];
            console.log("id="+id);
            if(id == null||id.toString() == "0" || !this.userInfo.hasOwnProperty(id)){
                console.log("id为空");
                this.changePlayerView(this.player_node_arr[i], null);
            }else{
                console.log("id不为空+id=" + id);
                this.changePlayerView(this.player_node_arr[i], this.userInfo[id], isShow, 1);
            }
        }
    },

    /**
     * 玩家头像部分信息显示
     */
    changePlayerView:function(node, data, isShow, status){
        console.log(node);
        if(data == null){
            let head_node = node.getChildByName("user").getChildByName("mask").getChildByName("head").getComponent(cc.Sprite);
            head_node.spriteFrame = this.head_atlas.getSpriteFrame("common-018");
            node.getChildByName("user").getChildByName("lab0").getComponent(cc.Label).string =  "";
            node.getChildByName("user").getChildByName("ready").active=false;
        }else{
            let head_node = node.getChildByName("user").getChildByName("mask").getChildByName("head");
            var name_node = node.getChildByName("user").getChildByName("lab0");
            var prepare_node = node.getChildByName("user").getChildByName("ready");
            node.active = true;
            if(!this.isKaiju){
                prepare_node.active = true;
            }
            console.log(data);
            console.log(data.id);
            if(this.zhuang != null && data.id.toString() == this.zhuang.toString()){
                node.getChildByName("user").getChildByName("zhuang").active=true;
            }else{
                node.getChildByName("user").getChildByName("zhuang").active=false;
            }
            let head = head_node.getComponent(cc.Sprite);
            name_node.active = true;
            name_node.getComponent(cc.Label).string =  cc.vv.Global.getNameStr(data.nickname);
            let head_url = data.headimgurl;
            cc.loader.load(head_url, function (err, texture) {
                head.spriteFrame = new cc.SpriteFrame(texture);
            });
            if(status.toString() != "1"){
                node.getChildByName("mask").active = true;
            }
        }
    }
});