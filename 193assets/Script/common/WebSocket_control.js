/**通讯类 */
cc.Class({
    extends: cc.Component,

    ctor: function () {
        this.ws = null;
        this.isConnect = false;
        this.isAutoReConnect = false;
        this.isWaiting = false; //等待中
        this.waitCount = 0;
        this.MAX_WAIT = 100; //最大等待次数
        this.web_url = "";
    },

    /**进入大厅创建长连接*/
    init: function (bool) {
        this.isAutoReConnect = bool;
        if (this.isConnect == false) {
            this.createWebSocket();
        }
    },

    createWebSocket: function () {
        var self = this;
        this.ws = new WebSocket(cc.vv.http.web_url);
        this.ws.onopen = function (event) {
            self.onOpen(event);
        };
        this.ws.onclose = function (event) {
            self.onClose(event);
        };
        this.ws.onerror = function (event) {
            self.onError(event);
        };
        this.ws.onmessage = function (event) {
            self.onMessage(event);
        };
    },

    onOpen: function (event) {
        console.log("onOpen");
        this.isConnect = true;
        this.waitCount = 0;
        this.isWaiting = false;
        cc.loadingControl.cancelReConnect();
    },

    onClose: function (event) {
        console.log("onClose");
        this.isConnect = false;
        if (!this.isWaiting && this.isAutoReConnect) {
            this.waitCount = 0;
            this.isWaiting = true;
            cc.loadingControl.beginReConnect('连接服务器中');
        }
    },

    onError: function (event) {
        console.log("onError");
        if(cc.clubControl && cc.hallControl.club_scene.active){
            cc.clubControl.fastJoinRoom();
        }
    },

    onMessage: function (event) {
        var data = JSON.parse(event.data);
        if (cc.sys.isNative == false && data.route != "heartbeat" && data.route != "cesu") {
            console.log(data);
        }
        switch (data.route) {
            case "create": //创建
            {
                this.onGetCreate(data.data);
                break;
            }
            case 'join': //加入
            {
                this.onGetJoin(data.data);
                break;
            }
            case 'jinru': //进入游戏
            {
                this.onGetJinru(data.data);
                break;
            }
            case 'ruzuo': //入座
            {
                this.onGetRuzuo(data.data);
                break;
            }
            case 'chonglian': //重连
            {
                this.onGetChonglian(data.data);
                break;
            }
            case 'kaiju': //开局
            {
                this.onGetkaiju(data.data);
                break;
            }
            case 'buhua':
            {
                this.onGetBuhua(data.data);
                break;
            }
            case 'hua': //抓牌
            {
                this.getHua(data.data);
                break;
            }
            case 'zhuapai': //抓牌
            {
                this.getZhuapai(data.data);
                break;
            }
            case 'dapai': //返回玩家打牌信息
            {
                this.getDapai(data.data);
                break;
            }
            case "caozuo_tx":
            {
                this.getCaozuo_tx(data.data);
                break;
            }
            case 'caozuo': //操作
            {
                this.onGetCaozuo(data.data);
                break;
            }
            case 'hu': //胡牌信息
            {
                this.onGetHu(data.data);
                break;
            }
            case 'lizuo': //离座
            {
                this.onGetLizuo(data.data);
                break;
            }
            case 'jiesan': //申请解散
            {
                this.onGetJiesan(data.data);
                break;
            }
            case 'toupiao': //返回玩家解散房间投票信息
            {
                this.onGetToupiao(data.data);
                break;
            }
            case 'heartbeat': //心跳
            {
                this.onGetHeartbeat(data.data);
                break;
            }
            case 'getGame': //断线重连
            {
                this.onGetGetGame(data.data);
                break;
            }
            case 'gameover': //游戏结束
            {
                this.onGetGameOver();
                break;
            }
            case 'jixu': //继续
            {
                this.onGetJixu(data.data);
                break;
            }
            case 'xiaoxi': //继续
            {
                this.onGetXiaoxi(data.data);
                break;
            }
            case 'cesu': //测速
            {
                this.onGetCesu();
                break;
            }
            case 'jszhanji':
            {
                this.onGetJszhanji(data.data);
                break;
            }
            case 'lixian': //离线
            {
                this.onGetLixian(data.data);
                break;
            }
            case 'club_rooms_change': //俱乐部房间有变化
            {
                if(cc.clubControl) cc.clubControl.getClubGames();
                break;
            }
            case 'club_games_change': //俱乐部玩法有变化
            {
                if(data.mid == cc.vv.userData.mid) return;
                if(cc.clubControl) cc.clubControl.getClubGames();
                break;
            }
            case 'ready': //有玩家准备好了
            {
                this.onGetReady(data.data);
                break;
            }
            case "fast_toupiao": //快速开始投票
            {
                this.onGetFast(data.data);
                break;
            }
            case "club_action": //申请加入俱乐部返回，被同意，或被拒绝
            {
                cc.loadingControl.onToggleView('notice_layer', data.data);
                break;
            }
        }
    },

    /**
     * 关闭webSocket
     * */
    onCloseWebSocket: function (isBack) {
        this.isAutoReConnect = isBack;
        this.ws.close();
    },

    /**
     * 封装方法
     * @param controller_name
     * @param method_name
     * @param data
     */
    sendWS: function (controller_name, method_name, data) {
        var json = {
            "controller_name": controller_name,
            "method_name": method_name,
            "data": data
        };
        if(json.method_name != "heartbeat" && json.method_name != "cesu"){
            console.log(json);
        }

        if(1 === this.ws.readyState){
            this.ws.send(JSON.stringify(json));
        }
    },

    /**
     * 返回创建房间
     * @param data
     */
    onGetCreate: function (data) {
        cc.hallControl.onReturnCreate(data);
    },

    /**
     * 返回加入房间
     */
    onGetJoin: function (data) {
        if(cc.hallControl){
            cc.hallControl.onReturnJoin(data);
        }else{
            cc.loginControl.onReturnCreate(data);
        }
    },

    /**
     * 返回离座
     */
    onGetLizuo: function (data) {
        cc.log("离坐啦");
        if(cc.loadingControl.game_scene && cc.loadingControl.game_scene.active){
            cc.gameControl.onReturnLizuo(data);
        }else if(cc.hallControl.club_scene && cc.hallControl.club_scene.active){
            cc.log("有点尴尬");
            cc.clubControl.getClubRoom();
        }
    },

    /**
     * 返回解散信息
     * @param data
     */
    onGetJiesan:function(data){
        if(cc.gameControl && cc.loadingControl.game_scene && cc.loadingControl.game_scene.active){
            cc.gameControl.onReturnJiesan(data);
        }
    },

    /**
     * 返回玩家解散房间投票信息
     * @param data
     */
    onGetToupiao:function(data){
        cc.gameControl.onReturnToupiao(data);
    },

    /**
     * 心跳
     */
    onGetHeartbeat: function () {

    },

    /**
     * 玩家离线
     */
    onGetLixian: function (data) {
        cc.log("玩家离线：", data.mid);
        if(cc.gameControl) cc.gameControl.onLixian(data.mid,true);
    },

    /**
     * 返回进入
     */
    onGetJinru: function (data) {
        cc.gameControl.onReturnJinru(data);
    },

    /**
     * 返回入座
     */
    onGetRuzuo: function (data) {
        cc.gameControl.onReturnRuzuo(data);
    },

    /**
     * 返回重连
     */
    onGetChonglian: function (data) {
        if(cc.gameControl) cc.gameControl.onReturnChonglian(data);
    },

    /**
     * 返回开局信息
     * @param data 牌面
     */
    onGetkaiju:function(data){
        cc.gameControl.onReturnKaiju(data);
    },

    onGetBuhua:function(data){
        cc.gameControl.onReturnBuhua(data);
    },

    getHua:function(data){
        cc.gameControl.onReturnHua(data);
    },

    getZhuapai:function(data){
        cc.gameControl.onReturnZhuapai(data)
    },

    getDapai:function(data){
        cc.gameControl.onReturnDapai(data);
    },

    /**
     * 返回操作提醒 
     */
    getCaozuo_tx: function (data) {
        cc.gameControl.onReturnCaozuo_tx(data)
    },

    /**
     * 返回操作
     */
    onGetCaozuo: function (data) {
        cc.gameControl.onReturnCaozuo(data);
    },

    onGetGameOver:function(){
        cc.gameControl.onReturnGameOver();
    },

    /**
     * 返回断线重连
     */
    onGetGetGame: function (data) {
        cc.gameControl.onReturnGetGame(data);
    },
    /**
     * 返回胡了
     */
    onGetHu:function(data){
        cc.gameControl.onReturnHu(data);
    },
    /**
     * 返回消息
     */
    onGetXiaoxi: function (data) {
        cc.gameControl.onReturnXiaoxi(data);
    },

    /**
     * 返回继续
     */
    onGetJixu: function (data) {
        cc.gameControl.onReturnJixu(data);
    },

    /**
     * 返回结算战绩
     */
    onGetJszhanji:function(data){
        if(cc.gameControl) cc.gameControl.onReturnJszhanji(data);
    },

    /**
     * 返回准备消息
     */
    onGetReady:function(data){
        if(cc.gameControl) cc.gameControl.onReturnReady(data.mid);
    },

    /**
     * 开始快速开始投票
     */
    onGetFast:function(data){
        if(cc.gameControl) cc.gameControl.onReturnFast(data);
    },

    /**
     * 返回测速
     */
    onGetCesu: function () {
        if(cc.gameControl){
            cc.gameControl.onReturnCesu();
        }
    }
});