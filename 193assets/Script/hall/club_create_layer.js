/**
 * 创建房间
 */
cc.Class({
    extends: cc.Component,

    properties: {
        fangfei_lab_arr: [cc.RichText]
    },

    ctor: function () {
        this.isShowing = true;
        this.renshu = 4;    //4人3人2人
        this.fangfei = 2;   //1AA 2房主3俱乐部支付
        this.jushu = 4;     //4局8局16局
        this.yu_num = 2;    //2钓2条鱼，4，6，8，10 99爆炸鱼
        this.fengding = 2;  //2自摸2封顶，4，6，0无限番
        this.yu_type = 1;   //1一五九钓鱼，2跟庄钓鱼
        this.menqing = 1;   //1门清
        this.wufeng = 0;    //1无风
        this.hua = 0;       //1花牌
        this.fenghu = 0;    //0  不封  1 封胡
        this.zidong = 0;    //0  不自动  1 自动
        this.kaifang = 0;   //0  不能开  1 能开
        this.shu = 1;       //开房数量
        this.ip = 1;        //同ip提醒
        this.zhunbei = 1;   //准备
        this.fast = 1;      //2/3人快速开始
        this.guize_id = 1;  //玩法规则id

        this.fangfei_data = {
            "fangzhu": {
                "2": [16, 24, 40],
                "3": [18, 27, 54],
                "4": [20, 30, 50]
            },
            "AA": {
                "2": [8, 12, 20],
                "3": [6, 9, 18],
                "4": [5, 8, 13]
            },
            "club": {
                "2": [10, 18, 30],
                "3": [15, 27, 45],
                "4": [20, 30, 50]
            }
        };
    },

    onLoad: function () {
        //this.onOpenView();
    },

    onOpenView: function (data, index) {
        this.club_data = data;
        this.isShowing = false;
        cc.log(this.club_data);
        //this.getRemeberedRoomRule();
        let btn1 = cc.find("bg/btn1",this.node);
        let btn2 = cc.find("bg/btn2",this.node);
        let set_node = cc.find("bg/node_set",this.node);
        cc.log(index,cc.clubControl.wanfa_num);
        if(0 == index){
            set_node.active = true;
            btn1.active = false;
            btn2.active = true;
            if(-1 == cc.clubControl.wanfa_num){
                this.getPublicRoomRule();
            }else{
                this.getWebRoomRule();
            }
        }else{
            set_node.active = false;
            btn1.active = true;
            btn2.active = false;
            this.getPrivateRoomRule();
        }
        //var bg = this.node.getChildByName('bg');
        //bg.scale = 0;
        //bg.runAction(cc.sequence(
        //    cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
        //    cc.callFunc(function () {
        //        this.isShowing = false;
        //    }.bind(this))
        //));
        ////TODO  2018年12月7日17:52:10   创建房间记忆
        //this.scheduleOnce(function(){
        //    this.getRemeberedRoomRule();
        //}.bind(this),0.1);
    },

    /**
     * 加载私人房本地数据
     */
    getPrivateRoomRule:function(){
        let userData = JSON.parse(cc.sys.localStorage.getItem('clubPrivateRoom'));
        if(userData){
            let strArr = ["renshu","jushu","yu_num","yu_type","fengding","menqing","hua","wufeng","fenghu","ip","zhunbei","fast"];
            for(let i = 0; i < strArr.length; i++){
                if(undefined != userData[strArr[i]]){
                    this[strArr[i]] = userData[strArr[i]];
                    cc.log(strArr[i],this[strArr[i]], userData[strArr[i]]);
                }
            }
        }

        this.showRoomRule();
    },

    /**
     * 加载玩法网络数据
     */
    getWebRoomRule:function(){
        let data, j = 0;
        for(let i = 0; i < cc.clubControl.wanfa_list.length; i++){
            if(2 == cc.clubControl.wanfa_list[i].type){
                if(cc.clubControl.wanfa_num == j){
                    data = cc.clubControl.wanfa_list[i];
                    this.guize_id = data.guize_id;
                    break;
                }
                j++;
            }
        }

        let strArr_0 = ["renshu","jushu","yu_num","yu_type","fengding","menqing","hua","wufeng","fenghu"];
        let strArr_1 = ["zidong","kaifang","shu","ip","zhunbei","fast"];
        let guize = data.guize;
        for(let i = 0; i < strArr_0.length; i++){
            if(undefined != data[strArr_1[i]]){
                this[strArr_1[i]] = data[strArr_1[i]];
                cc.log(strArr_1[i],this[strArr_1[i]], data[strArr_1[i]]);
            }

            if(undefined != guize[strArr_0[i]]){
                this[strArr_0[i]] = guize[strArr_0[i]];
                cc.log(strArr_0[i],this[strArr_0[i]], guize[strArr_0[i]]);
            }
        }

        this.showRoomRule();
    },

    /**
     * 加载玩法本地数据
     */
    getPublicRoomRule:function(){
        let userData = JSON.parse(cc.sys.localStorage.getItem('clubPublicRoom'));
        if(userData){
            let strArr = ["zidong","renshu","jushu","yu_num","yu_type","fengding","menqing","hua","shu","wufeng","fenghu","ip","zhunbei","fast"];
            for(let i = 0; i < strArr.length; i++){
                if(undefined != userData[strArr[i]]){
                    this[strArr[i]] = userData[strArr[i]];
                    cc.log(strArr[i],this[strArr[i]], userData[strArr[i]]);
                }
            }
        }

        this.kaifang = cc.clubControl.kaifang;

        this.showRoomRule();
    },

    /**
     * 展示玩法数据
     */
    showRoomRule:function(){
        this.isShowing = true;
        cc.find("bg/ToggleGroup0/toggle1",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup0/toggle2",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup0/toggle3",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup0/toggle" + (5 - parseInt(this.renshu)),this.node).getComponent(cc.Toggle).isChecked = true;  //  几人局
        let tog = cc.find("bg/toggle12",this.node);
        tog.active = true;
        if(2 == parseInt(this.renshu)) tog.active = false;

        //if(this.fangfei == 1){        //是否是玩家AA支付
        //    cc.find("bg/ToggleGroup0/toggle4",this.node).getComponent(cc.Toggle).isChecked = true;
        //}else{
        //    cc.find("bg/ToggleGroup0/toggle4",this.node).getComponent(cc.Toggle).isChecked = false;
        //}
        this.updateView();
        //4  8  16
        //1  2  3
        cc.find("bg/ToggleGroup1/toggle1",this.node).getComponent(cc.Toggle).isChecked = false;          //多少局
        cc.find("bg/ToggleGroup1/toggle2",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup1/toggle3",this.node).getComponent(cc.Toggle).isChecked = false;
        if(this.jushu.toString() == "4"){
            cc.find("bg/ToggleGroup1/toggle1",this.node).getComponent(cc.Toggle).isChecked = true;
        }else if(this.jushu.toString() == "8"){
            cc.find("bg/ToggleGroup1/toggle2",this.node).getComponent(cc.Toggle).isChecked = true;
        }else if(this.jushu.toString() == "16"){
            cc.find("bg/ToggleGroup1/toggle3",this.node).getComponent(cc.Toggle).isChecked = true;
        }
        cc.find("bg/ToggleGroup3/toggle0",this.node).getComponent(cc.Toggle).isChecked = false;          //     钓鱼数  2 4 6 8 10 12  无限番
        cc.find("bg/ToggleGroup3/toggle1",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup3/toggle2",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup3/toggle3",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup3/toggle4",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup3/toggle5",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup3/toggle6",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup3/toggle" + parseInt(parseInt(this.yu_num) / 2),this.node).getComponent(cc.Toggle).isChecked = true;

        cc.find("bg/ToggleGroup4/toggle2",this.node).getComponent(cc.Toggle).isChecked = false;          //     钓鱼封顶数  2 4 6 封顶  无限番
        cc.find("bg/ToggleGroup4/toggle4",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup4/toggle6",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup4/toggle0",this.node).getComponent(cc.Toggle).isChecked = false;
        cc.find("bg/ToggleGroup4/toggle" + this.fengding,this.node).getComponent(cc.Toggle).isChecked = true;

        cc.find("bg/ToggleGroup5/toggle0",this.node).getComponent(cc.Toggle).isChecked = false;          //     钓鱼类型 0 一五九钓鱼 ，  1 跟庄钓鱼
        cc.find("bg/ToggleGroup5/toggle1",this.node).getComponent(cc.Toggle).isChecked = false;
        if(this.yu_type.toString() != "-1"){
            cc.find("bg/ToggleGroup5/toggle" + (parseInt(this.yu_type) - 1),this.node).getComponent(cc.Toggle).isChecked = true;
        }
        if(this.menqing.toString() == "1"){
            cc.find("bg/toggle6",this.node).getComponent(cc.Toggle).isChecked = true;
        }else{
            cc.find("bg/toggle6",this.node).getComponent(cc.Toggle).isChecked = false;
        }
        if(this.hua.toString() == "1"){
            cc.find("bg/toggle7",this.node).getComponent(cc.Toggle).isChecked = true;
        }else{
            cc.find("bg/toggle7",this.node).getComponent(cc.Toggle).isChecked = false;
        }
        if(this.fenghu.toString() == "1"){
            cc.find("bg/toggle4",this.node).getComponent(cc.Toggle).isChecked = true;
        }else{
            cc.find("bg/toggle4",this.node).getComponent(cc.Toggle).isChecked = false;
        }
        if(this.wufeng.toString() == "1"){
            cc.find("bg/toggle3",this.node).getComponent(cc.Toggle).isChecked = true;
        }else{
            cc.find("bg/toggle3",this.node).getComponent(cc.Toggle).isChecked = false;
        }
        if(this.zidong.toString() == "1"){
            cc.find("bg/node_set/toggle8",this.node).getComponent(cc.Toggle).isChecked = true;
        }else{
            cc.find("bg/node_set/toggle8",this.node).getComponent(cc.Toggle).isChecked = false;
        }
        if(this.kaifang.toString() == "1"){
            cc.find("bg/node_set/toggle9",this.node).getComponent(cc.Toggle).isChecked = true;
        }else{
            cc.find("bg/node_set/toggle9",this.node).getComponent(cc.Toggle).isChecked = false;
        }
        if(this.ip.toString() == "1"){
            cc.find("bg/toggle10",this.node).getComponent(cc.Toggle).isChecked = true;
        }else{
            cc.find("bg/toggle10",this.node).getComponent(cc.Toggle).isChecked = false;
        }
        if(this.zhunbei.toString() == "1"){
            cc.find("bg/toggle11",this.node).getComponent(cc.Toggle).isChecked = true;
        }else{
            cc.find("bg/toggle11",this.node).getComponent(cc.Toggle).isChecked = false;
        }
        if(this.fast.toString() == "1"){
            cc.find("bg/toggle12",this.node).getComponent(cc.Toggle).isChecked = true;
        }else{
            cc.find("bg/toggle12",this.node).getComponent(cc.Toggle).isChecked = false;
        }
        let lab = cc.find("bg/node_set/lab_num",this.node).getComponent(cc.Label);
        lab.string = this.shu;

        this.isShowing = false;
    },

    onClickView: function () {
        //this.isShowing = true;
        //var bg = this.node.getChildByName('bg');
        //bg.scale = 1;
        //bg.runAction(cc.sequence(
        //    cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
        //    cc.callFunc(function () {
        this.node.active = false;
        //    }.bind(this))
        //));
    },

    onDestroy: function () {
        //this.hallControl = null;
        //cc.loader.setAutoReleaseRecursively('Prefab/hall/create_layer', true);
    },

    onClickBtn: function (event, type) {
        if (this.isShowing) return;
        cc.log(type);
        switch (type.toString()) {
            case 'back':
            {
                this.onClickView();
                break;
            }
            case "save":
            {
                this.setWanfa();
                break;
            }
            case "ok":
            {
                cc.vv.audioMgr.playSFX('ui_open', 'mp3');
                this.sendCreate();
                break;
            }
            case 'ren_4':
            case 'ren_3':
            case 'ren_2':
            {
                let arr = type.toString().split('_');
                let index = parseInt(arr[1]);
                this.renshu = index;

                let tog = cc.find("bg/toggle12",this.node);
                if(2 == index){
                    tog.active = false;
                }else{
                    tog.active = true;
                }
                this.updateView();
                break;
            }
            case 'ju_4':
            case 'ju_8':
            case 'ju_16':
            {
                let arr = type.toString().split('_');
                let index = parseInt(arr[1]);
                this.jushu = index;
                break;
            }
            case 'feng_2':
            case 'feng_4':
            case 'feng_6':
            case 'feng_0':
            {
                let arr = type.toString().split('_');
                let index = parseInt(arr[1]);
                this.fengding = index;
                break;
            }
            case 'diaoyu_2':
            case 'diaoyu_4':
            case 'diaoyu_6':
            case 'diaoyu_8':
            case 'diaoyu_10':
            case 'diaoyu_12':
            case 'diaoyu_1':            //爆炸鱼
            {
                let arr = type.toString().split('_');
                let index = parseInt(arr[1]);
                this.yu_num = index;
                if (index == 1 && this.yu_type != -1) {
                    //选中爆炸鱼，一五九钓鱼和跟庄钓鱼取消选择
                    let toggleGroup5 = this.node.getChildByName('bg').getChildByName('ToggleGroup5');
                    for (let i = 0; i < 2; i++) {
                        let toggle = toggleGroup5.getChildByName('toggle' + i);
                        toggle.getComponent(cc.Toggle).isChecked = false;
                    }
                    this.yu_type = -1;
                }
                if (index != 1 && this.yu_type == -1) {
                    //选中其他的，一五九钓鱼和跟庄钓鱼选择 第一个
                    let toggleGroup5 = this.node.getChildByName('bg').getChildByName('ToggleGroup5');
                    for (let i = 0; i < 2; i++) {
                        let toggle = toggleGroup5.getChildByName('toggle' + i);
                        toggle.getComponent(cc.Toggle).isChecked = i == 0 ? true : false;
                    }
                    this.yu_type = 1;
                }
                console.log("this.yu_type=" + this.yu_type);
                break;
            }
            case 'yu_1':  //一五九钓鱼
            case 'yu_2':  //跟庄钓鱼
            {
                let arr = type.toString().split('_');
                let index = parseInt(arr[1]);
                if(this.yu_type == -1){
                    let toggleGroup3 = this.node.getChildByName('bg').getChildByName('ToggleGroup3');
                    for (let i = 0; i < 7; i++) {
                        let toggle = toggleGroup3.getChildByName('toggle' + i);
                        toggle.getComponent(cc.Toggle).isChecked = i == 0 ? true : false;
                    }
                }
                this.yu_type = index;
                if (this.yu_num == 1) {
                    let toggleGroup3 = this.node.getChildByName('bg').getChildByName('ToggleGroup3');
                    for (let i = 0; i < 7; i++) {
                        let toggle = toggleGroup3.getChildByName('toggle' + i);
                        toggle.getComponent(cc.Toggle).isChecked = i == 0 ? true : false;
                    }
                    this.yu_num = 2;
                    cc.find("bg/ToggleGroup3/toggle1",this.node).getComponent(cc.Toggle).isChecked = true;
                    cc.find("bg/ToggleGroup3/toggle0",this.node).getComponent(cc.Toggle).isChecked = false;
                }
                break;
            }
            case 'fangfei': // 房费
            {
                this.fangfei = this.fangfei == 1 ? 2 : 1;
                this.updateView();
                break;
            }
            case 'men': //门清
            {
                this.menqing = this.menqing == 1 ? 0 : 1;
                break;
            }
            case 'hua'://无花
            {
                this.hua = this.hua == 1 ? 0 : 1;
                break;
            }
            case 'wufeng'://无风
            {
                this.wufeng = this.wufeng == 1 ? 0 : 1;
                break;
            }
            case 'fenghu'://四笔封胡
            {
                this.fenghu = this.fenghu == 1 ? 0 : 1;
                break;
            }
            case 'ip'://同ip提醒
            {
                this.ip = this.ip == 1 ? 0 : 1;
                break;
            }
            case 'zhunbei'://准备
            {
                this.zhunbei = this.zhunbei == 1 ? 0 : 1;
                break;
            }
            case 'fast'://2/3人快速开始
            {
                this.fast = this.fast == 1 ? 0 : 1;
                break;
            }
            case 'kaifang'://开房
            {
                this.kaifang = this.kaifang == 1 ? 0 : 1;
                break;
            }
            case 'zidong'://自动开房
            {
                cc.log(this.zidong);
                this.zidong = this.zidong == 1 ? 0 : 1;
                cc.log(this.zidong);
                break;
            }
            case 'up'://展开
            {
                let btn = cc.find("bg/node_set/btn3",this.node);
                btn.active = false;
                let show = cc.find("bg/node_set/scrollView",this.node);
                show.active = true;
                break;
            }
            case 'down'://关闭
            {
                let show = cc.find("bg/node_set/scrollView",this.node);
                show.active = false;
                let btn = cc.find("bg/node_set/btn3",this.node);
                btn.active = true;
                break;
            }
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            {
                let show = cc.find("bg/node_set/scrollView",this.node);
                show.active = false;
                let btn = cc.find("bg/node_set/btn3",this.node);
                btn.active = true;
                let label = cc.find("bg/node_set/lab_num",this.node).getComponent(cc.Label);
                label.string = type.toString();
                cc.log(typeof(type));
                this.shu = parseInt(type);
                break;
            }
        }
    },

    updateView: function () {
        var temp = ['AA', 'fangzhu', 'club'];
        //var data = this.fangfei_data[temp[this.fangfei - 1]];
        var data = this.fangfei_data[temp[2]];
        var obj = data[this.renshu.toString()];
        console.log("obj=" + obj);
        var temp2 = ['4', '8', '16'];
        for (let i = 0; i < 3; i++) {
            let richtext = this.fangfei_lab_arr[i];
            richtext.string = '<color=#51463E>' + temp2[i] + '局</c><color=#EE6958>(' + obj[i] + '钻)</color>';
        }
    },

    /**
     * 请求创建
     */
    sendCreate: function () {
        let postData = {
            "mid": cc.vv.userData.mid,
            'club_id': this.club_data.id, //俱乐部id
            //'fangfei': this.fangfei,     //1:AA  2:房主 3:俱乐部
            'renshu': this.renshu,           //人数 4、3、2
            'jushu': this.jushu,          //局数 4、8、16
            'yu_num': this.diaoyu,        //炸弹鱼2  4  6  8  10
            'yu_type': this.yu,           //1:一五九钓鱼  2:跟庄钓鱼
            'fengding': this.fengding,        //封顶 0:无限  2  4  6
            'menqing': this.menqing,          //门清 0  1
            'hua': this.hua,              //无花
            'wufeng': this.wufeng,        //无风
            'fenghu': this.fenghu,        //四笔封胡
            'ip': this.ip,                //同ip提醒
            'zhunbei': this.zhunbei,      //准备
            'fast': this.fast             //2/3人快速开始
        };

        cc.vv.WebSocket.sendWS("RoomController", "create", postData);
        cc.sys.localStorage.setItem('clubPrivateRoom', JSON.stringify(postData));
    },

    /**
     * 设置俱乐部玩法
     */
    setWanfa: function () {
        //let show = this.node.getChildByName("sprite");
        //show.active = false;
        if(2 == parseInt(this.renshu)) this.fast = 0;
        let postData = {
            "mid": cc.vv.userData.mid,
            'club_id': this.club_data.id, //俱乐部id
            'zidong': this.zidong,        //0不自动开房，1:自动开房
            'kaifang': this.kaifang,      //0:成员不能开私人房，1:成员可以开私人房
            'renshu': this.renshu,        //人数 4、3、2
            'jushu': this.jushu,          //局数 4、8、16
            'yu_num': this.yu_num,        //炸弹鱼2  4  6  8  10
            'yu_type': this.yu_type,      //1:一五九钓鱼  2:跟庄钓鱼
            'fengding': this.fengding,    //封顶 0:无限  2  4  6
            'menqing': this.menqing,      //门清 0  1
            'wufeng': this.wufeng,        //无风
            //'wutong': "",                //无风
            //'fangfei': this.fangfei,     //1:AA  2:房主 3:俱乐部
            'hua': this.hua,              //无花
            'shu': this.shu,              //数量
            'fenghu': this.fenghu,        //四笔封胡
            'ip': this.ip,                //同ip提醒
            'zhunbei': this.zhunbei,      //准备
            'fast': this.fast             //2/3人快速开始
            //'guize_id': ""             //2/3人快速开始
        };

        if(-1 != cc.clubControl.wanfa_num) postData["guize_id"] = this.guize_id;

        cc.log(postData);
        let url = cc.vv.http.URL;
        //cc.vv.http.sendRequest(url + "club_update", postData, function(data){
        cc.vv.http.sendRequest(url + "save_games", postData, function(data){
            cc.log(data);
            cc.hallControl.showMsg(data.msg);
            if (1 == data.status) {
                cc.clubControl.kaifang = this.kaifang;
                cc.clubControl.changeClubRoom();
                cc.clubControl.enterClub();
                cc.sys.localStorage.setItem('clubPublicRoom', JSON.stringify(postData));
            }
        }.bind(this));

        //if(0 != this.zidong){
        //    this.sendCreate();
        //}
    }
});