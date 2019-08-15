cc.Class({
    extends: cc.Component,

    properties: {
        item_s: cc.Prefab,
        item_r: cc.Prefab,
        item_t: cc.Prefab,
        item_w: cc.Prefab,
        laba_node: cc.Node, //喇叭节点
        head:cc.SpriteFrame
    },

    onLoad() {
        cc.clubControl = this;

        this.member_layer = null; //成员界面
        this.create_layer = null; //玩法设置界面
        this.rank_layer = null; //排行榜界面
        this.record_layer = null; //战绩界面
        this.statistics_layer = null; //场次统计界面
        this.details_layer = null; //详情界面
        this.show_node = null; //排行榜界面

        this.node_layer = this.node.getChildByName("node_layer");
    },

    initView: function () {
        this.room_list = [];      //当前玩法房间列表
        this.fast_boolen = null; //是否快速加入
        this.tea_data = null;    //俱乐部数据
        this.join_number = null; //申请玩家数量
        this.ban_uid = null;     //被禁赛玩家ID
        this.wanfa_list = null;  //玩法列表
        this.is_all_room = [0,0];   //是否加载完所有玩法
        this.wanfa_num = -1;     //当前玩法数字
        this.all_new = 0;        //当前玩法房间数量
        this.club_lock = 0;      //俱乐部功能是否解锁；1、已解锁；0、未解锁
        this.kaifang = 0;        //普通玩家可开私人房；1、可以；0、不行
        this.push_zuan = 0;      //充值钻石；0、取出；1、充值
        this.begin_x = 561;      //喇叭开始坐标
        this.end_x = -25;        //喇叭初始结束坐标
    },

    onOpenView: function (data) {
        cc.log(data);
        cc.loadingControl.waiting_layer.active = false;
        this.loadResTexture(cc.loadingControl.splashScene, 'big_bg/hallbg_6');
        cc.hallControl.ui_layer.active = false;
        this.initView();
        this.showLaba(data.gonggao);
        this.club_data = data;
        this.kaifang = data.kaifang;
        this.club_lock = data.status;
        this.clubNum();
        this.changeClubShow();

        this.showButton();

        let label_0 = cc.find("bottom_bg/id_bg/label_name", this.node).getComponent(cc.Label);
        let label_1 = cc.find("bottom_bg/id_bg/label_id", this.node).getComponent(cc.Label);
        let label_2 = cc.find("bottom_bg/zuan_bg/label", this.node).getComponent(cc.Label);
        label_0.string = cc.vv.Global.getNameStr(data.name);
        label_1.string = "ID:" + data.id;
        label_2.string = data.num;

        this.openCheckJoin();
    },

    /**
     * 显示喇叭内容
     * @param str 公告文本
     */
    showLaba:function(str){
        this.laba_node.getComponent(cc.Label).string = str;

        //计算喇叭翻转的位置
        this.end_x = -25 - this.laba_node.width;
        this.laba_node.x = this.begin_x;
    },

    /**
     * 加载本地图片
     */
    loadResTexture: function (node, url) {
        cc.loader.loadRes(url, function (err, texture2D) {
            node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture2D);
        });
    },

    onClickView: function () {
        this.closeCheckJoin();
        cc.hallControl.ui_layer.active = true;
        this.loadResTexture(cc.loadingControl.splashScene, 'big_bg/hallbg_' + cc.vv.userData.bg_index);
        this.node.active = false;
    },

    /**
     * 根据自己在俱乐部的管理等级显示按钮
     */
    showButton: function () {
        let btn0 = cc.find("regularVersion/left_bg/view/content/btn_3", this.node);
        let btn1 = cc.find("teaHouseEdition/left_bg/view/content/btn_4" ,this.node);

        if (3 == cc.hallControl.club_level) {
            btn0.active = true;
            btn1.active = true;
        } else {
            btn0.active = false;
            btn1.active = false;
        }

        let btn_5 = cc.find("bottom_bg/zuan_bg/btn_addzuan", this.node);
        let btn_6 = cc.find("bottom_bg/btn_set", this.node);
        let zuan_bg = cc.find("bottom_bg/zuan_bg", this.node);
        if (3 != cc.hallControl.club_level && 2 != cc.hallControl.club_level) {
            btn_5.active = false;
            btn_6.active = false;
            zuan_bg.active = false;
        } else {
            btn_5.active = true;
            btn_6.active = true;
            zuan_bg.active = true;
        }
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'qie_club': //切换俱乐部
            {
                this.changeClub();
                break;
            }
            case 'member':      //成员列表
            case 'rank':        //排行榜
            case 'record':      //战绩
            case 'statistics':  //场次统计
            case 'details':     //俱乐部详情
            {
                cc.log(this.club_lock);
                if (0 == this.club_lock) {
                    cc.hallControl.showMsg("俱乐部功能未解锁，请累计充值3000钻，即可解锁完整功能。");
                    return;
                }
                this.onToggleView(type.toString());
                break;
            }
            case 'cooperation':  //群合作
            {
                let node = this.node.getChildByName("hezuo");
                if (node.active) {
                    node.active = false;
                    node.x = -320;
                    node.y = -135;
                } else {
                    cc.log(event.target);
                    let worldPos = event.target.parent.convertToWorldSpaceAR(event.target.position);
                    let pos = node.convertToNodeSpaceAR(worldPos);
                    node.position = pos;
                    if(182 == event.target.width) node.x -= 120;
                    else node.x -= 150;
                    node.y -= 132.5;
                    cc.log(node.position);
                    node.active = true
                }
                break;
            }
            case 'check': {
                this.showWanfaRooms();
                break;
            }
            case 'cha':
            case 'jing': {
                let num = cc.vv.userData.club_type;
                cc.vv.userData.club_type = num == 0 ? 1 : 0;
                cc.vv.userData.saveUserInfo();
                this.changeClubShow();
                break;
            }
            case 'switch': {
                let _switch = this.node.getChildByName("switch");
                _switch.active = false;
                break;
            }
            case 'tea_close': {
                let tea = this.node.getChildByName("teaRoom");
                tea.active = false;
                break;
            }
            case 'create': {
                let create = this.node.getChildByName("create_club");
                if (create.active) create.active = false;
                else create.active = true;
                break;
            }
            case 'create_club': {
                let str1 = cc.find("create_club/editBox_0", this.node).getComponent(cc.EditBox);
                let str2 = cc.find("create_club/editBox_1", this.node).getComponent(cc.EditBox);
                let postData = {
                    "mid": cc.vv.userData.mid,
                    "name": str1.string,
                    "gonggao": str2.string
                };
                let url = cc.vv.http.URL;
                cc.vv.http.sendRequest(url + "club_create", postData, function (data) {
                    if (data.msg) cc.hallControl.showMsg(data.msg);
                    if (1 == data.status) {
                        str1.string = "";
                        str2.string = "";
                    }
                }.bind(this));
                break;
            }
            case 'join': {
                let join = this.node.getChildByName("join_club");
                let str = cc.find("join_club/wenzi_bg/label_number", this.node).getComponent(cc.Label);
                str.string = "";
                if (join.active) join.active = false;
                else join.active = true;
                break;
            }
            case 'join_ok': {
                let str = cc.find("join_club/wenzi_bg/label_number", this.node).getComponent(cc.Label);
                let postData = {
                    "mid": cc.vv.userData.mid,
                    "club_id": parseInt(str.string)
                };
                let url = cc.vv.http.URL;
                cc.vv.http.sendRequest(url + "club_join", postData, function (data) {
                    str.string = "";
                    if (data.msg) cc.hallControl.showMsg(data.msg);
                }.bind(this));
                break;
            }
            case 'kf_exit': {
                let kf = cc.find("bottom_bg/kf_bg", this.node);
                kf.active = false;
                break;
            }
            case 'shezhi': {
                if (0 == this.club_lock) {
                    cc.hallControl.showMsg("俱乐部功能未解锁，请累计充值3000钻，即可解锁完整功能。");
                    return;
                }

                if (1 == this.kaifang) {
                    let kf = cc.find("bottom_bg/kf_bg", this.node);
                    kf.active = true;
                    return;
                }
                this.onToggleView("create_layer", 0);
                break;
            }
            case 'set_wanfa_0':
            case 'set_wanfa_1': {
                let num = parseInt(type[type.length - 1]);
                let kf = cc.find("bottom_bg/kf_bg", this.node);
                kf.active = false;
                this.onToggleView("create_layer", num);
                break;
            }
            case 'less': //取出钻石
            {
                this.push_zuan = 0;
                cc.loadingControl.onToggleView('notice_layer', '是否要取出钻石？', this.chongzhi.bind(this));
                //this.chongzhi(0);
                break;
            }
            case 'plus': //存入钻石
            {
                this.push_zuan = 1;
                cc.loadingControl.onToggleView('notice_layer', '是否要充值钻石？', this.chongzhi.bind(this));
                //this.chongzhi(1);
                break;
            }
            case 'zuan': //存入钻石
            {
                let rec = this.node.getChildByName("recharge");
                rec.active = true;

                let lab = rec.getChildByName("label").getComponent(cc.Label);
                lab.string = "俱乐部剩余钻石: " + this.club_data.num;

                let btn_0 = rec.getChildByName("btn_0").getComponent(cc.Button);
                let btn_1 = rec.getChildByName("btn_1").getComponent(cc.Button);
                btn_0.interactable = false;
                btn_1.interactable = false;
                if (3 == cc.hallControl.club_level) {
                    btn_0.interactable = true;
                    btn_1.interactable = true;
                } else if (2 == cc.hallControl.club_level) {
                    btn_1.interactable = true;
                }
                break;
            }
            case 'close_recharge': //存入钻石
            {
                let rec = this.node.getChildByName("recharge");
                let lable = cc.find("recharge/editBox_0", this.node).getComponent(cc.EditBox);
                lable.string = "";
                rec.active = false;
                break;
            }
            case 'join_0':
            case 'join_1':
            case 'join_2':
            case 'join_3':
            case 'join_4':
            case 'join_5':
            case 'join_6':
            case 'join_7':
            case 'join_8':
            case 'join_9': {
                var arr = type.toString().split('_');
                var index = arr[1];
                let str = cc.find("join_club/wenzi_bg/label_number", this.node).getComponent(cc.Label);
                if (6 > str.string.length) {
                    str.string += index;
                }
                break;
            }
            case 'join_10': {
                let str = cc.find("join_club/wenzi_bg/label_number", this.node).getComponent(cc.Label);
                str.string = "";
                break;
            }
            case 'join_11': {
                let str = cc.find("join_club/wenzi_bg/label_number", this.node).getComponent(cc.Label);
                str.string = str.string.substring(0, str.string.length - 1);
                break;
            }
            case 'fast_join': {
                if (0 == this.club_lock) {
                    cc.hallControl.showMsg("俱乐部功能未解锁，请累计充值3000钻，即可解锁完整功能。");
                    return;
                }

                if (cc.vv.Global.room_id) {
                    cc.loginControl.sendJoinRoom(cc.vv.Global.room_id);
                    return;
                }

                cc.loadingControl.waiting_layer.active = true;
                cc.loadingControl.waiting_lab.string = '正在搜索房间中';
                this.fast_boolen = true;
                this.getClubGames();
                break;
            }
            case 'join_room': {
                if (cc.vv.Global.room_id) {
                    cc.loginControl.sendJoinRoom(cc.vv.Global.room_id);
                    return;
                }

                this.joinRoom();
                break;
            }
            case 'jiesan': {
                cc.loadingControl.onToggleView('notice_layer', '是否解散该房间？', this.closeRoom.bind(this));
                break;
            }
            case 'yao': {
                break;
            }
            case 'close_banned': {
                let ban = this.node.getChildByName("banned");
                ban.active = false;
                break;
            }
            case 'wanfa_layer': {
                this.openWanfa();
                break;
            }
            case 'wanfa_0':
            case 'wanfa_1':
            case 'wanfa_2':
            case 'wanfa_3': {
                this.wanfa_num = parseInt(type[type.length - 1]) - 1;
                this.changeTog();
                this.showWanfaRooms();
                break;
            }
            case 'auto_open':
            case 'auto_close': {
                //let auto = cc.find("recharge/auto_pop",this.node);
                //if(auto.active) auto.active = false;
                //else auto.active = true;
                cc.loadingControl.onToggleView('notice_layer', '此功能正在开发中，敬请期待');
                break;
            }
            case "kick_0":
            case "kick_1":
            case "kick_2":
            case "kick_3":
            {
                let num = parseInt(type[type.length - 1]);
                this.kickPlayer(num);
                break;
            }
        }
    },

    /**
     * 顶部各玩法按钮的更新显示
     */
    changeTog: function () {
        let togArr = cc.find("top_bg/toggleContainer", this.node);
        for (let i = 0; i < togArr.childrenCount; i++) {
            let tog = togArr.children[i].getChildByName("checkmark");
            if (i == this.wanfa_num + 1) {
                tog.active = true;
            } else {
                tog.active = false;
            }
        }
    },

    /**
     * 加载俱乐部弹窗
     */
    onToggleView: function (type, data, callback) {
        switch (type) {
            case 'member':
            {
                this.closeCheckJoin();
                if (this.member_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/club_member_list', function (err, prefab) {
                        self.member_layer = cc.instantiate(prefab);
                        self.member_layer.parent = self.node_layer;
                        self.member_layer.getComponent('club_member').onOpenView(self);
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.member_layer.active = true;
                    this.member_layer.getComponent('club_member').onOpenView(this);
                }
                break;
            }
            case 'rank':
            {
                if (this.rank_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/club_rank_list', function (err, prefab) {
                        self.rank_layer = cc.instantiate(prefab);
                        self.rank_layer.parent = self.node_layer;
                        self.rank_layer.getComponent('club_rank_list').onOpenView(self);
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.rank_layer.active = true;
                    this.rank_layer.getComponent('club_rank_list').onOpenView(this);
                }
                break;
            }
            case 'record':
            {
                if (this.record_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/club_record_list', function (err, prefab) {
                        self.record_layer = cc.instantiate(prefab);
                        self.record_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.record_layer.active = true;
                    this.record_layer.getComponent('club_record_list').onOpenView();
                }
                break;
            }
            case 'statistics':
            {
                if (this.statistics_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/club_statistics_list', function (err, prefab) {
                        self.statistics_layer = cc.instantiate(prefab);
                        self.statistics_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.statistics_layer.active = true;
                    this.statistics_layer.getComponent('club_statistics_list').onOpenView();
                }
                break;
            }
            case 'details':
            {
                if (this.details_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/club_details_list', function (err, prefab) {
                        self.details_layer = cc.instantiate(prefab);
                        self.details_layer.parent = self.node_layer;
                        self.details_layer.getComponent('club_details_list').onOpenView(self.club_data);
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.details_layer.active = true;
                    this.details_layer.getComponent('club_details_list').onOpenView(this.club_data);
                }
                break;
            }
            case 'create_layer':
            {
                //let kf = cc.find("bottom_bg/kf_bg",this.node);
                //kf.active = false;
                this.getClubGames();
                if (this.create_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    let self = this;
                    cc.loader.loadRes('Prefab/hall/club_create_layer', function (err, prefab) {
                        self.create_layer = cc.instantiate(prefab);
                        self.create_layer.parent = self.node_layer;
                        self.create_layer.getComponent('club_create_layer').onOpenView(self.club_data, data);
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.create_layer.active = true;
                    this.create_layer.getComponent('club_create_layer').onOpenView(this.club_data, data);
                }
                break;
            }
        }
    },

    update: function () {
        this.updateLaba();
    },

    /**
     * 更新喇叭位置
     */
    updateLaba: function () {
        this.laba_node.x -= 1;
        if (this.laba_node.x <= this.end_x) {
            this.laba_node.x = this.begin_x;
        }
    },

    /**
     * 开关玩法列表界面
     */
    openWanfa: function () {
        let wanfaList = this.node.getChildByName("wanfaList");
        if (wanfaList.active) {
            wanfaList.active = false;
            return 0;
        } else {
            wanfaList.active = true;
        }

        let content = cc.find("scrollView/view/content", wanfaList);
        let arr = this.wanfa_list;
        let item_prefab = this.item_w;
        let child_arr = content.children;
        let child_len = content.childrenCount;
        let len = arr.length;
        let max_len = Math.max(len, child_len);
        for (let i = 0; i < max_len; ++i) {
            let item = null;
            if (len && i < len && 2 == arr[i].type) {
                if (i < child_len) {
                    item = child_arr[i];
                    item.active = true;
                } else {
                    item = cc.instantiate(item_prefab);
                    item.parent = content;
                }
                let js = item.getComponent('item_list_w');
                js.onOpenView(arr[i], i);
            } else {
                if (i < child_len) {
                    item = child_arr[i];
                    item.active = false;
                }
            }
        }
    },

    /**
     * 请求俱乐部玩法列表
     */
    getClubGames: function () {
        var postData = {
            "club_id": this.club_data.id
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_games", postData, this.dealClubGameData.bind(this));
    },

    /**
     * 俱乐部全部玩法回调
     * @param data 玩法数据
     */
    dealClubGameData: function (data) {
        cc.log(data);
        if (data.msg) cc.hallControl.showMsg(data.msg);
        if (1 == data.status) {
            this.wanfa_list = data.data;
            if (0 == this.wanfa_list.length) {
                let content = cc.find("scrollView/view/content", this.show_node);
                for (let i = 0; i < content.childrenCount; i++) {
                    if (content.children[i].active) {
                        content.children[i].active = false;
                    }
                }

                if (this.fast_boolen) {
                    cc.loadingControl.waiting_layer.active = false;
                    cc.hallControl.showMsg("暂无空余房间");
                    this.fast_boolen = false;
                }
            }

            this.show_wanfa();
        }
    },

    /**
     * 显示玩法
     */
    show_wanfa: function () {
        let togArr = cc.find("top_bg/toggleContainer", this.node);

        for (let i = 0; i < 3; i++) {
            let tog = togArr.children[i + 1];
            if (i < this.wanfa_list.length) {
                tog.active = true;
                let lab = tog.getChildByName("label").getComponent(cc.Label);
                lab.string = "柳州麻将(" + this.wanfa_list[i].guize.renshu + "人)";
            } else {
                tog.active = false;
            }
        }

        for (let i = 0; i < togArr.childrenCount; i++) {
            let tog = togArr.children[i].getChildByName("checkmark");
            if (tog.active) {
                if (0 == i) {
                    this.wanfa_num = -1;
                } else {
                    this.wanfa_num = i - 1;
                }
            }
        }

        this.showWanfaRooms();
    },

    /**
     * 显示全部玩法/单个玩法的房间
     */
    showWanfaRooms: function () {
        let guize_id, j = 0;
        this.is_all_room = [0,0];
        if (-1 == this.wanfa_num) {
            for (let i = 0; i < this.wanfa_list.length; i++) {
                if (2 == this.wanfa_list[i].type) {
                    if (0 == j) this.all_new = 0;
                    guize_id = this.wanfa_list[i].guize_id;
                    this.getClubRoom(guize_id);
                    j++;
                }
            }
            this.is_all_room[0] = j
        } else {
            for (let i = 0; i < this.wanfa_list.length; i++) {
                if (2 == this.wanfa_list[i].type) {
                    if (this.wanfa_num == j) {
                        this.all_new = -1;
                        guize_id = this.wanfa_list[i].guize_id;
                        this.getClubRoom(guize_id);
                        break;
                    }
                    j++;
                }
            }
        }
    },

    /**
     * 请求俱乐部房间列表
     */
    getClubRoom: function (gid) {
        let node_0 = cc.find("top_bg/toggleGroup/toggle1", this.node).getComponent(cc.Toggle);
        let sta = 0;
        if (!node_0.isChecked) sta = 1;
        if (this.fast_boolen) sta = 0;

        var postData = {
            "club_id": this.club_data.id,
            "status": sta,
            "guize_id": gid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_rooms", postData, this.dealClubRoomData.bind(this));
    },

    dealClubRoomData: function (data) {
        cc.log(data);
        if (1 == data.status) {
            let content = cc.find("scrollView/view/content", this.show_node);
            let arr = data.data;
            let item_prefab, str;
            if ("teaHouseEdition" == this.show_node.name) {
                item_prefab = this.item_t;
                str = "item_list_t";
            } else {
                item_prefab = this.item_r;
                str = "item_list_r";
            }

            let len, i = 0, j = 0;
            let child_arr = content.children;
            let child_len = content.childrenCount;
            if (-1 != this.all_new) {
                i = this.all_new;
                len = i + arr.length;
                if (0 == this.all_new) this.room_list = [];
                this.is_all_room[1] += 1
            } else {
                len = arr.length;
                this.room_list = [];
            }
            let max_len = Math.max(len, child_len);
            for (i; i < max_len; ++i) {
                let item = null;
                if (len && i < len) {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = true;
                    } else {
                        item = cc.instantiate(item_prefab);
                        item.parent = content;
                    }
                    let js = item.getComponent(str);
                    js.onOpenView(arr[j]);
                    this.room_list.push(arr[j]);
                } else {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = false;
                    }
                }
                j += 1;
            }

            this.all_new = len;

            //cc.log("打印中",this.is_all_room);
            if (this.fast_boolen && this.is_all_room[0] == this.is_all_room[1]) {
                this.fastJoinRoom();
                this.fast_boolen = false;
            }
        }
    },

    /**
     * 快速加入游戏
     */
    fastJoinRoom: function () {
        if (0 == this.room_list.length) {
            cc.loadingControl.waiting_layer.active = false;
            cc.hallControl.showMsg("暂无空余房间");
            return
        }

        let roomList = [], rid, info;
        for (let i = 0; i < this.room_list.length; i++) {
            if (0 < this.room_list[i].userInfo.length) {
                let obj = this.room_list[i];
                roomList.push(obj)
            }
        }
        cc.log(roomList,this.room_list);

        if (1 < roomList.length) {
            for (let i = 0; i < roomList.length - 1; i++) {
                let info_0 = roomList[i].userInfo.length;
                let info_1 = roomList[i + 1].userInfo.length;
                info = roomList[i];
                if (info_0 > info_1) {
                    info = roomList[i];
                }
            }
            //cc.log(info);

            rid = info.roomInfo.guize.room_id;
        } else if (1 == roomList.length) {
            rid = roomList[0].roomInfo.guize.room_id;
        } else {
            rid = this.room_list[0].roomInfo.guize.room_id;
        }

        cc.vv.WebSocket.sendWS("RoomController", "join", {
            "mid": cc.vv.userData.mid,
            'room_id': rid
        });

        this.room_list.splice(0, 1)
    },

    /**
     * 刷新俱乐部数据
     */
    enterClub: function () {
        var postData = {
            "club_id": this.club_data.id
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_index", postData, function (data) {
            cc.log(data);
            if (1 == data.status) {
                this.club_data = data.data;
            }
            //let label_2 = cc.find("bottom_bg/zuan_bg/label",this.node).getComponent(cc.Label);
            //label_2.string = this.club_data.club.num;
        }.bind(this));
    },

    clubNum: function () {
        if (300 > this.club_data.num && 3 == cc.hallControl.club_level) {
            cc.loadingControl.onToggleView('notice_layer', '当前钻石低于300钻，请及时充值', this.callNum.bind(this));
        }
    },

    callNum: function () {
        let rec = this.node.getChildByName("recharge");
        rec.active = true;

        let lab = rec.getChildByName("label").getComponent(cc.Label);
        lab.string = "俱乐部剩余钻石: " + this.club_data.num;
    },

    closeClub: function () {
        if (this.member_layer && this.member_layer.active) this.member_layer.active = false;
        if (this.create_layer && this.create_layer.active) this.create_layer.active = false;
        if (this.rank_layer && this.rank_layer.active) this.rank_layer.active = false;
        if (this.record_layer && this.record_layer.active) this.record_layer.active = false;
        if (this.statistics_layer && this.statistics_layer.active) this.statistics_layer.active = false;
        if (this.details_layer && this.details_layer.active) this.details_layer.active = false;

        cc.hallControl.ui_layer.active = true;
        this.loadResTexture(cc.loadingControl.splashScene, 'big_bg/hallbg_' + cc.vv.userData.bg_index);
        this.node.active = false;
    },

    /**
     * 切换俱乐部显示形式；经典版或者茶楼版
     */
    changeClubShow: function () {
        let node_0 = this.node.getChildByName("regularVersion");
        let node_1 = this.node.getChildByName("teaHouseEdition");
        if (0 == cc.vv.userData.club_type) {
            node_0.active = true;
            node_1.active = false;
            this.show_node = node_0;
        } else {
            node_0.active = false;
            node_1.active = true;
            this.show_node = node_1;
        }

        this.getClubGames();
    },

    /**
     * 关闭玩法/关闭玩法自动开房
     */
    closeWanfa: function (guize_id) {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.club_data.id,
            "guize_id": guize_id
        };

        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "stop_games", postData, function (data) {
            cc.log(data);
            if (data.msg) cc.hallControl.showMsg(data.msg);
            if (1 == data.status) {
                this.wanfa_num = -1;
                this.changeTog();
                let wanfaList = this.node.getChildByName("wanfaList");
                if (wanfaList.active) wanfaList.active = false;
                this.getClubGames();
            }
        }.bind(this));
    },

    /**
     * 请求俱乐部列表数据
     */
    changeClub: function () {
        var postData = {
            "mid": cc.vv.userData.mid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "my_club_list", postData, this.onReturnData.bind(this));

        let _switch = this.node.getChildByName("switch");
        _switch.active = true;
    },

    /**
     * 俱乐部存取钻石
     */
    chongzhi: function () {
        let lable = cc.find("recharge/editBox_0", this.node).getComponent(cc.EditBox);
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.club_data.id,
            "num": parseInt(lable.string),
            "status": this.push_zuan
        };

        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_chongzhi", postData, function (data) {
            cc.log(data);
            if (data.msg) cc.hallControl.showMsg(data.msg);
            if (data.status == 1) {
                lable.string = "";
                let lab = cc.find("recharge/label", this.node).getComponent(cc.Label);
                lab.string = "俱乐部剩余钻石: " + data.data.club_num;
                let label_2 = cc.find("bottom_bg/zuan_bg/label", this.node).getComponent(cc.Label);
                label_2.string = data.data.club_num;

                //cc.hallControl.club_status = data.jiesuo;
                this.club_lock = data.jiesuo;
                // this.showButton();
            }
        }.bind(this));
    },

    /**
     * 处理俱乐部列表数据
     */
    onReturnData: function (data) {
        if (data.status == 1) {
            let content = cc.find("switch/scrollView/view/content", this.node);
            cc.log(data);
            let arr = data.data;
            let item_prefab = this.item_s;
            let child_arr = content.children;
            let child_len = content.childrenCount;
            let len = arr.length;
            let max_len = Math.max(len, child_len);
            for (var i = 0; i < max_len; ++i) {
                let item = null;
                if (len && i < len) {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = true;
                    } else {
                        item = cc.instantiate(item_prefab);
                        item.parent = content;
                    }
                    let js = item.getComponent("item_list_s");
                    js.onOpenView(arr[i]);
                } else {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = false;
                    }
                }
            }
        }
    },

    /**
     * 私人房开设成功，开房弹窗关闭，并刷新房间列表
     */
    changeClubRoom: function () {
        this.create_layer.active = false;

        this.getClubGames();
    },

    /**
     * 踢玩家
     */
    kickPlayer: function (num) {
        cc.vv.WebSocket.sendWS('RoomController', 'remove', {
            mid: cc.vv.userData.mid,
            uid: this.tea_data.userInfo[num].id,
            room_id: this.tea_data.roomInfo.guize.room_id
        });
        let tea = this.node.getChildByName("teaRoom");
        tea.active = false;
    },

    /**
     * 显示茶楼模式下玩法房间
     */
    showTeaRoom: function (data) {
        let tea = this.node.getChildByName("teaRoom");
        tea.active = true;
        this.tea_data = data;

        let len = parseInt(data.roomInfo.guize.renshu);
        for (let i = 0; i < 4; i++) {
            let seat = tea.getChildByName("head_bg_" + i);
            let data_0 = this.tea_data.userInfo[i];
            if (i < len) {
                seat.active = true;
                let head = seat.getChildByName("head");
                let label_0 = seat.getChildByName("label_0").getComponent(cc.Label);
                let label_1 = seat.getChildByName("label_1").getComponent(cc.Label);
                let btn = seat.getChildByName("btn");
                label_0.string = "";
                label_1.string = "";
                btn.active = false;
                if (data_0) {
                    cc.hallControl.loadHeadTexture(head, data_0.headimgurl);
                    label_0.string = data_0.nickname;
                    label_1.string = "id:" + data_0.id;

                    if (3 == cc.hallControl.club_level || 2 == cc.hallControl.club_level) {
                        btn.active = true;
                    }
                }else{
                    cc.log("头像还原");
                    head.getComponent(cc.Sprite).spriteFrame = this.head;
                }
            } else {
                seat.active = false;
            }
        }

        let lab0 = tea.getChildByName("label_0").getComponent(cc.Label);
        let lab1 = tea.getChildByName("label").getComponent(cc.Label);

        lab0.string = "牌桌ID: " + data.roomInfo.guize.room_id;
        lab1.string = "柳州麻将 " + (data.roomInfo.guize.menqing == 1 ? "门清 " : "") +
            (data.roomInfo.guize.fangfei == 1 ? "房费均摊 " : data.roomInfo.guize.fangfei == 2 ? "房主支付 " : "俱乐部支付 ") +
            (data.roomInfo.guize.yu_num == 1 ? "爆炸鱼 " : "钓" + data.roomInfo.guize.yu_num + "条鱼 ") +
            (data.roomInfo.guize.fengding == 0 ? "无限番 " : "自摸" + data.roomInfo.guize.fengding + "封顶 ") +
            (data.roomInfo.guize.yu_type == -1 ? "" : data.roomInfo.guize.yu_type == 1 ? "一五九钓鱼 " : "跟庄钓鱼 ") +
            (data.roomInfo.guize.hua == 0 ? "" : "有花 ") + (data.roomInfo.guize.fenghu == 0 ? "" : "四笔封胡 ") +
            (data.roomInfo.guize.wufeng == 0 ? "" : "无风");
    },

    /**
     * 改名成功
     */
    changeName: function (name, number) {
        let label_0 = cc.find("bottom_bg/id_bg/label_name", this.node).getComponent(cc.Label);
        let label_2 = cc.find("bottom_bg/zuan_bg/label", this.node).getComponent(cc.Label);

        label_0.string = name;
        label_2.string = number;
    },

    /**
     * 解散房间
     */
    closeRoom: function () {
        let tea = this.node.getChildByName("teaRoom");
        tea.active = false;

        cc.vv.WebSocket.sendWS('RoomController', 'jiesan', {
            mid: cc.vv.userData.mid,
            room_id: this.tea_data.roomInfo.guize.room_id,
            status: 1
        });

        this.getClubGames();
    },

    /**
     * 进入房间
     */
    joinRoom: function () {
        let tea = this.node.getChildByName("teaRoom");
        tea.active = false;

        cc.vv.WebSocket.sendWS("RoomController", "join", {
            "mid": cc.vv.userData.mid,
            'room_id': this.tea_data.roomInfo.guize.room_id
        });
    },

    /**
     * 关闭定时请求申请列表数据
     */
    openCheckJoin: function () {
        if (3 == cc.hallControl.club_level || 2 == cc.hallControl.club_level) {
            this.schedule(this.checkJoin, 5);
        }
    },

    /**
     * 定时请求申请列表数据
     */
    checkJoin: function () {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.club_data.id
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_join_list", postData, function (data) {
            if (data.status == 1) {
                let arr = data.data;
                this.join_number = arr.length;
                let red_dot_0 = cc.find("regularVersion/left_bg/red_dot", this.node);
                let red_dot_1 = cc.find("teaHouseEdition/left_bg/red_dot", this.node);
                if (0 < arr.length) {
                    red_dot_0.active = true;
                    red_dot_1.active = true;
                } else {
                    red_dot_0.active = false;
                    red_dot_1.active = false;
                }
            }
        }.bind(this));
    },

    /**
     * 打开禁赛选择界面
     */
    openBanned: function (uid) {
        let ban = this.node.getChildByName("banned");
        ban.active = true;

        this.ban_uid = uid;
    },

    /**
     * 禁赛
     */
    banned: function () {
        let arr = this.returnToggle();
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.club_data.id,
            "uid": this.ban_uid,
            "longtime": arr[0],
            "type": arr[1]
        };
        cc.log(this.ban_uid, arr, postData);
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_jinsai", postData, function (data) {
            cc.log(data);
            if (data.msg) cc.hallControl.showMsg(data.msg);
            if (1 == data.status) {
                let ban = this.node.getChildByName("banned");
                ban.active = false;
                let js = this.member_layer.getComponent("club_member");
                js.sendUser();
            }
        }.bind(this));
    },

    returnToggle: function () {
        let arr = [0, 0];
        let tog_0 = cc.find("banned/toggleGroup0", this.node);
        let tog_1 = cc.find("banned/toggleGroup1", this.node);
        for (let i = 0; i < 4; i++) {
            let check_0 = tog_0.children[i].getComponent(cc.Toggle);
            let check_1 = tog_1.children[i].getComponent(cc.Toggle);

            if (check_0.isChecked) arr[0] = i + 1;
            if (check_1.isChecked) arr[1] = i + 1;
        }
        return arr;
    },

    /**
     * 关闭定时请求申请列表数据
     */
    closeCheckJoin: function () {
        if (3 == cc.hallControl.club_level || 2 == cc.hallControl.club_level) {
            this.unschedule(this.checkJoin);
        }
    }
});