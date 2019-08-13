/**
 * 俱乐部
 */
cc.Class({
    extends: cc.Component,

    properties: {
        node_layer: cc.Node,
        scrollview: cc.Node,
        content: cc.Node,
        item_prefab: cc.Prefab
    },

    ctor: function () {
        this.isShowing = false;
        this.begin_y = 250;
        this.club_notice_layer = null;
    },

    onLoad: function () {
        //this.scrollview.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.onOpenView();
    },

    onTouchMove: function (event) {
        let delta = event.getDelta();
        this.content.y += delta.y;
        if (this.content.y <= this.begin_y) {
            this.content.y = this.begin_y;
        } else if (this.content.y >= this.begin_y + this.content.height - this.scrollview.height) {
            this.content.y = this.begin_y + this.content.height - this.scrollview.height
        }
    },

    onOpenView: function () {
        this.isShowing = true;
        //请求俱乐部数据true
        this.sendRequest();
        //var bg = this.node.getChildByName('bg');
        //bg.runAction(cc.sequence(
        //    cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
        //    cc.callFunc(function () {
                this.isShowing = false;
        //    }.bind(this))
        //));
        this.node.active = true;
    },

    onClickView: function () {
        this.isShowing = true;
        //var bg = this.node.getChildByName('bg');
        let str0 = cc.find("bg/icon/EditBox",this.node).getComponent(cc.EditBox);
        str0.string = "";
        //bg.scale = 1;
        //bg.runAction(cc.sequence(
        //    cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
        //    cc.callFunc(function () {
        //        this.isShowing = false;
        this.node.active = false;
            //}.bind(this))
        //));
        //this.node.active = false;
    },

    onDestroy: function () {
        this.club_notice_layer = null;
        //this.scrollview.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        //cc.loader.setAutoReleaseRecursively('Prefab/hall/club_layer', true);
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'back':
            {
                this.onClickView();
                break;
            }
            case 'check':
            {
                this.checkClub();
                break;
            }
            case 'create':
            {
                this.onToggleView(type.toString());
                break;
            }
            case 'create_club':
            {
                this.createClub();
                break;
            }
        }
    },

    onToggleView: function (type) {
        switch (type) {
            case 'club_notice_layer': //俱乐部提示
            {
                if (this.club_notice_layer == null) {
                    cc.loadingControl.waiting_layer.active = true;
                    cc.loadingControl.waiting_lab.string = '加载中';
                    var self = this;
                    cc.loader.loadRes('Prefab/hall/club_notice_layer', function (err, prefab) {
                        self.club_notice_layer = cc.instantiate(prefab);
                        self.club_notice_layer.parent = self.node_layer;
                        self.scheduleOnce(function () {
                            cc.loadingControl.waiting_layer.active = false;
                        }, 0.5);
                    });
                } else {
                    this.club_notice_layer.active = true;
                    this.club_layer.getComponent('Club_notice_layer').onOpenView();
                }
                break;
            }
            case 'create': //俱乐部提示
            {
                let create = cc.find("bg/create_club",this.node);
                if (create.active) {
                    create.active = false;
                } else {
                    create.active = true;
                }
                break;
            }
        }
    },

    returnEditboxString:function(bool){
        if(bool){
            let str0 = cc.find("bg/icon/EditBox",this.node).getComponent(cc.EditBox).string;
            return str0;
        }else{
            let str1 = cc.find("bg/create_club/editBox_0",this.node).getComponent(cc.EditBox).string;
            let str2 = cc.find("bg/create_club/editBox_1",this.node).getComponent(cc.EditBox).string;
            let _arr = [str1, str2];
            return _arr;
        }
    },

    /**
     * 请求俱乐部列表数据
     */
    sendRequest: function () {
        var postData = {
            "mid": cc.vv.userData.mid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "my_club_list", postData, this.onReturnData.bind(this));
    },

    /**
     * 处理俱乐部列表数据
     */
    onReturnData: function (data) {
        if (data.status == 1) {
            cc.log(data);
            // this.initView(index);
            //if(!this.node.active) return;
            if(this.isShowing) return;
            let arr = data.data;
            let content = this.content;
            let item_prefab = this.item_prefab;
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
                    let js = item.getComponent("club_item");
                    js.onOpenView(arr[i],1,this);
                } else {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = false;
                    }
                }
            }
            cc.loadingControl.waiting_layer.active = false;
        }
    },

    /**
     * 申请创建俱乐部
     */
    createClub: function () {
        let arr = this.returnEditboxString(false);
        cc.log(arr);
        var postData = {
            "mid": cc.vv.userData.mid,
            "name": arr[0],
            "gonggao": arr[1]
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_create", postData, this.onReturnCreateData.bind(this));
    },

    /**
     * 处理申请俱乐部回调
     */
    onReturnCreateData: function (data) {
        cc.log(data);
        if (1 == data.status) {
            this.onToggleView("create");
            let str1 = cc.find("bg/create_club/editBox_0",this.node).getComponent(cc.EditBox);
            let str2 = cc.find("bg/create_club/editBox_1",this.node).getComponent(cc.EditBox);
            str1.string = "";
            str2.string = "";
            //this.enterClub(data.club_id);
            this.sendRequest();
            cc.loadingControl.waiting_layer.active = true;
            cc.loadingControl.waiting_lab.string = '刷新俱乐部列表中';
        }
        cc.hallControl.showMsg(data.msg);
    },

    /**
     * 获取俱乐部信息，进入俱乐部界面
     * @param num 俱乐部ID
     */
    enterClub: function (num) {
        var postData = {
            "club_id": num
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_index", postData, this.onReturnEnterData.bind(this));
    },

    /**
     * 俱乐部信息回调
     * @param data 俱乐部数据
     */
    onReturnEnterData:function(data){
        if(1 == data.status){
            cc.log(data);

            cc.hallControl.onToggleView("club_scene",data.data);
        }
    },

    /**
     * 搜索俱乐部
     */
    checkClub: function () {
        let str = this.returnEditboxString(true);
        var postData = {
            "club_id": str
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_list", postData, this.onReturnCheckData.bind(this));
    },

    /**
     * 搜索俱乐部回调
     */
    onReturnCheckData: function (data) {
        cc.log(data);
        if(data.msg) cc.hallControl.showMsg(data.msg);
        let str0 = cc.find("bg/icon/EditBox",this.node).getComponent(cc.EditBox);
        str0.string = "";
        if (1 == data.status) {
            // this.initView(index);
            let arr = data.data;
            let content = this.content;
            let item_prefab = this.item_prefab;
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
                    let js = item.getComponent("club_item");
                    js.onOpenView(arr[i],2,this);
                } else {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = false;
                    }
                }
            }
        }
    },

    timerContrl:function(){
        this.schedule(function() {
            this.sendRequest();
        }, 1, 5, 1);
    },

    /**
     * 强制输入框只能输入数字
     * @param str 玩家实时输入的字符串
     * @param lab 输入框
     */
    testNumber_0:function(str, lab){
        let number = cc.vv.Global.isNumber(str);
        lab.string = number;
    }
});