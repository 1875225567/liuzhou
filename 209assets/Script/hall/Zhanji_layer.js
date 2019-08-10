/**
 * 战绩层
 */
var PLAYERCOUNT = 4; //玩家最大个数

cc.Class({
    extends: cc.Component,

    properties: {
        view_arr: [cc.Node], //0战绩1详情
        scrollview_arr: [cc.Node], //滑动组
        content_arr: [cc.Node], //容器组
        item_arr: [cc.Prefab],
        color_arr: [cc.Color]
    },

    ctor: function () {
        this.isShowing = false;
        this.space = 126;
        this.begin_y = -68;
        this.temp_y = 260;
    },

    onLoad: function () {
        for (let i = 0; i < 2; i++) {
            let scrollview = this.scrollview_arr[i];
            scrollview.index = i;
            //scrollview.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        }
        this.onOpenView();
    },

    onOpenView: function () {
        console.log("执行了onOpenView");
        var bg = this.node.getChildByName('bg');
        //bg.scale = 1;
        this.view_arr[0].active = true;
        this.view_arr[1].active = false;
        this.sendZhanjiList();
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
            cc.callFunc(function () {
                this.isShowing = false;
            }.bind(this))
        ));
    },

    onClickView: function () {
        this.isShowing = true;
        var bg = this.node.getChildByName('bg');
        //bg.scale = 1;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
            cc.callFunc(function () {
                this.isShowing = false;
                this.node.active = false;
            }.bind(this))
        ));
        //this.isShowing = false;
        //this.node.active = false;
    },

    onTouchMove: function (event) {
        console.log("执行了onTouchMove");
        let scrollview = event.target;
        let index = scrollview.index;
        let content = this.content_arr[index];
        var delta = event.getDelta();
        console.log(delta);
        content.y += delta.y;
        console.log("content.y=" + content.y);
        console.log("content.height=" + content.height);
        console.log("scrollview.height=" + scrollview.height);
        console.log(scrollview);
        if (content.y >= content.height - scrollview.height) {
            content.y = content.height - scrollview.height;
        }
        if (content.y < this.temp_y) {
            content.y = this.temp_y;
        }
    },

    onDestroy: function () {
        for (let i = 0; i < 2; i++) {
            let scrollview = this.scrollview_arr[i];
            scrollview.index = i;
            scrollview.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        }
        cc.loader.setAutoReleaseRecursively('Prefab/hall/zhanji_layer', true);
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'back0':
            {
                this.onClickView();
                break;
            }
            case 'back1':
            {
                this.view_arr[0].active = true;
                this.view_arr[1].active = false;
                break;
            }
        }
    },

    /**
     * 初始化界面
     * @param _index 0：战绩   1：详情
     */
    initView: function (_index) {
        let len = this.view_arr.length;
        for (let i = 0; i < len; i++) {
            this.view_arr[i].active = _index === i ? true : false;
        }
    },

    /**
     * 初始化界面数据
     * @param data 战绩数据
     * @param index 0：战绩   1：详情
     */
    updateView: function (data, index) {
        this.initView(index);
        let arr = data.data;
        let content = this.content_arr[index];
        let item_prefab = this.item_arr[index];
        //content.y = this.temp_y;
        let child_arr = content.children;
        let child_len = content.childrenCount;
        let len = arr.length;
        //content.height = this.temp_y + len *  this.space;
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
                //item.y = this.begin_y - i * this.space;
                this.showItem(item, arr[i], i + 1, index);
            } else {
                if (i < child_len) {
                    item = child_arr[i];
                    item.active = false;
                }
            }
        }
        //content.removeAllChildren();
        //cc.log("加载item中:" + arr.length);
        //cc.loadingControl.showWaiting(true);
        //this.scheduleOnce(function () {
        //    for(let i = 0; i < arr.length; i++){
        //        let item = cc.instantiate(item_prefab);
        //        item.parent = content;
        //        //cc.log("加载item中:" + arr[i],item.active);
        //        this.showItem(item, arr[i], i + 1, index);
        //    }
        //}.bind(this), 1.0);
    },

    /**
     * 处理item
     */
    showItem: function (node, obj, i, index) {
        let lab0 = node.getChildByName("lab0").getComponent(cc.Label);
        let lab1 = node.getChildByName("lab1").getComponent(cc.Label);
        let btn = node.getChildByName("btn");
        if (index == 0) {
            lab0.string = "房间号: " + obj.room_id;
        } else {
            lab0.string = "第 " + i + " 局";
        }
        if(obj.time) lab1.string = obj.time;
        if(obj.updated_at) lab1.string = obj.updated_at;
        btn.uid = obj;
        btn.index = index; //0战绩1详情
        btn.on(cc.Node.EventType.TOUCH_END, this.onClickBtnItem, this);

        let users = obj.users;
        let fangzhu = obj.fangzhu;
        for (var j = 0; j < PLAYERCOUNT; ++j) {
            let player = node.getChildByName("player" + j);
            if (j < users.length) {
                let boss = player.getChildByName('boss'); //房主
                if(index == 0){
                    boss.active = fangzhu.toString() == users[j].id.toString() ? true : false;
                }else{
                    boss.active = false;
                }
                player.active = true;
                cc.hallControl.loadHeadTexture(player, users[j].headimgurl);
                let _lab0 = player.getChildByName("lab0");
                let _lab1 = player.getChildByName("lab1");
                _lab0.getComponent(cc.Label).string = cc.vv.Global.getNameStr(users[j].nickname);
                _lab1.getComponent(cc.Label).string = users[j].fen > 0 ? "+" + users[j].fen : users[j].fen;
                _lab1.color = users[j].fen > 0 ? this.color_arr[1] : this.color_arr[0];
            } else {
                player.active = false;
            }
        }
        cc.log(this.view_arr[0].active,this.view_arr[1].active);
    },

    /**
     * 点击按钮
     */
    onClickBtnItem: function (event) {
        var btn = event.target;
        var obj = btn.uid;
        var index = btn.index;
        console.log(obj);
        if (index == 0) {
            //请求战绩详情
            //var rid = obj.rid;
            var rid = obj.id;
            let postData = {
                'rid': rid
            };
            cc.vv.http.sendRequest(cc.vv.http.zhanjiInfo_url, postData, this.onReturnZhanjiInfo.bind(this));
        } else {
            //请求战绩回放
            var logs_id = obj.logs_id;
            let postData = {
                'logs_id': logs_id
            };
            cc.vv.http.sendRequest(cc.vv.http.replayInfo_url, postData, this.onReturnReplayInfo.bind(this));
        }
    },

    /**
     * 请求战绩列表
     */
    sendZhanjiList: function () {
        var postData = {
            'mid': cc.vv.userData.mid
        };
        cc.vv.http.sendRequest(cc.vv.http.zhanji_url, postData, this.onReturnZhanjiList.bind(this));
    },

    /**
     * 请求战绩列表
     */
    onReturnZhanjiList: function (data) {
        console.log(data);
        if (data.status == 1) {
            this.updateView(data.data, 0);
        } else {
            cc.loadingControl.showMsg(data.msg);
        }
    },

    /**
     * 返回战绩详情
     */
    onReturnZhanjiInfo: function (data) {
        console.log(data);
        this.updateView(data, 1);
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