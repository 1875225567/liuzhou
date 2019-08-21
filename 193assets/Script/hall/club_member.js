cc.Class({
    extends: cc.Component,

    properties: {
        item_0: cc.Prefab,
        item_1: cc.Prefab
    },

     onLoad () {
        this.application = null;
        this.item_data = null;
     },

    onOpenView: function (compent) {
        this.isShowing = true;
        this.com = compent;
        let node_0 = this.node.getChildByName("scrollView_member");
        if(node_0.active){
            this.sendUser();
        }else{
            this.sendJoin();
        }

        let node_1 = cc.find("toggleGroup/toggle2",this.node).getComponent(cc.Toggle);
        cc.log(cc.hallControl.club_level);
        if(3 == cc.hallControl.club_level || 2 == cc.hallControl.club_level){
            node_1.interactable = true;
        }else{
            node_1.interactable = false;
        }

        this.loadDot();

        //var bg = this.node.getChildByName('bg');
        //bg.runAction(cc.sequence(
        //    cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
        //    cc.callFunc(function () {
        //        this.isShowing = false;
        //    }.bind(this))
        //));
        this.node.active = true;
    },

    loadDot:function(){
        if(3 == cc.hallControl.club_level || 2 == cc.hallControl.club_level){
            let red_dot = cc.find("toggleGroup/red_dot",this.node);
            if(0 < this.com.join_number){
                let lab = red_dot.getChildByName("lab").getComponent(cc.Label);
                lab.string = this.com.join_number;
                red_dot.active = true;
            }else{
                red_dot.active = false;
            }
        }
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'take':
            {
                this.changeNode();
                break;
            }
            case 'back':
            {
                this.node.active = false;
                cc.clubControl.openCheckJoin();
                break;
            }
            case 'agree_0':
            case 'agree_1':
            {
                var arr = type.toString().split('_');
                var index = parseInt(arr[1]);
                this.agreeMember(index);
                break;
            }
            case 'refresh':
            {
                let node_0 = this.node.getChildByName("scrollView_member");

                if(node_0.active){
                    this.sendUser();
                }else{
                    this.sendJoin();
                }
                break;
            }
            case 'close_pop':
            {
                this.showBtnPop();
                break;
            }
            case "prohibited"://禁赛
            {
                let show = this.node.getChildByName("btn_pop");
                show.active = false;
                cc.clubControl.openBanned(this.item_data.mid);
                break;
            }
            case "abbrechen"://取消禁赛
            {
                this.closeJin();
                break;
            }
            case "reduce"://取消管理员
            {
                this.dealWith(1);
                break;
            }
            case "promotion"://提升为管理员
            {
                this.dealWith(2);
                break;
            }
            case "kick_out"://踢出俱乐部
            {
                this.exitClub();
                break;
            }
            case "yao"://邀请按钮
            {
                let yao = cc.find("scrollView_member/bottom_bg/bg",this.node);
                if(yao.active) yao.active = false;
                else yao.active = true;
                break;
            }
            case "wechat_yao"://微信邀请
            {
                let yao = cc.find("scrollView_member/bottom_bg/bg",this.node);
                yao.active = false;
                cc.loadingControl.onToggleView('notice_layer', '已复制，是否跳转到微信？', this.shareClub.bind(this));
                break;
            }
            case "game_yao"://游戏邀请
            {
                let yao = cc.find("scrollView_member/bottom_bg/bg",this.node);
                yao.active = false;
                break;
            }
        }
    },

    /**
     * 复制俱乐部id并分享到微信
     */
    shareClub:function(){
        let str = "俱乐部[" + this.com.club_data.id +  "]玩家[" + cc.vv.userData.mid + "]邀请你加入俱乐部，打牌更方便，更便捷。(复制此消息打开游戏可直接申请加入俱乐部)";
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            cc.vv.Global.shareAndroid(str);
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            cc.vv.Global.shareIos(str);
        }
    },

    changeNode:function(){
        let node_0 = this.node.getChildByName("scrollView_member");
        let node_1 = this.node.getChildByName("scrollView_application");

        if(node_0.active){
            node_0.active = false;
            node_1.active = true;
            this.sendJoin();
        }else{
            node_0.active = true;
            node_1.active = false;
            this.sendUser();
        }
    },

    /**
     * 全部同意/拒绝申请 0 同意 1 拒绝
     */
    agreeMember:function(num){
        let uid = this.gatUserId();
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.com.club_data.id,
            "uids": uid,
            "status": num
        };
        cc.log(uid,num);
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_all_jiaru", postData, function(data){
            cc.log(data);
            this.sendJoin()
        }.bind(this));
    },

    gatUserId:function(){
        let arr = "";
        for(let i = 0; i < this.application.length; i++){
            let str = this.application[i].mid;
            arr += str;
            if(i != this.application.length - 1){
                arr += ",";
            }
        }
        return arr;
    },

    /**
     * 请求成员列表数据
     */
    sendUser: function () {
        var postData = {
            "club_id": this.com.club_data.id
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_users", postData, this.onReturnUser.bind(this));
    },

    /**
     * 请求申请列表数据
     */
    sendJoin: function () {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.com.club_data.id
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_join_list", postData, this.onReturnJoin.bind(this));
    },

    /**
     * 处理成员列表数据
     */
    onReturnUser: function (data) {
        if (data.status == 1) {
            cc.log(data);
            // this.initView(index);
            let arr = data.data.data;
            let content = cc.find("scrollView_member/view/content",this.node);
            let item_prefab = this.item_0;
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
                    let js = item.getComponent("item_m_0");
                    js.onOpenView(arr[i],this);
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
     * 处理申请列表数据
     */
    onReturnJoin: function (data) {
        if (data.status == 1) {
            cc.log(data);
            // this.initView(index);
            this.application = data.data;
            let arr = data.data;
            let content = cc.find("scrollView_application/view/content",this.node);
            let item_prefab = this.item_1;
            let child_arr = content.children;
            let child_len = content.childrenCount;
            let len = arr.length;
            this.com.join_number = len;
            this.loadDot();
            cc.clubControl.changeRedDot();
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
                    let js = item.getComponent("item_m_1");
                    js.onOpenView(arr[i],this);
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
     * 强制输入框只能输入数字
     * @param str 玩家实时输入的字符串
     * @param lab 输入框
     */
    testNumber_0:function(str, lab){
        let number = cc.vv.Global.isNumber(str);
        lab.string = number;
    },

    /**
     * 显示对玩家进行管理的按钮弹窗
     */
    showBtnPop:function(node,data){
        let pop = this.node.getChildByName("btn_pop");
        if(node){
            let worldPos = node.parent.convertToWorldSpaceAR(node.position);
            let pos = pop.convertToNodeSpaceAR(worldPos);
            let child = pop.children[0];
            child.position = pos;
            child.x -= 160;
            child.y -= 43;

            this.item_data = data;
            this.showBtn();
            pop.active = true;
        }else{
            pop.active = false;
            return 0;
        }
    },

    /**
     * 显示操作按钮
     */
    showBtn: function () {
        let btn_0 = cc.find("btn_pop/sprite/btn_0",this.node);
        let btn_1 = cc.find("btn_pop/sprite/btn_1",this.node);
        let btn_2 = cc.find("btn_pop/sprite/btn_2",this.node);
        let btn_3 = cc.find("btn_pop/sprite/btn_3",this.node);
        let btn_4 = cc.find("btn_pop/sprite/btn_4",this.node);
        btn_4.active = true;
        if(1 == this.item_data.jin){
            btn_0.active = true;
            btn_1.active = false;
        }else{
            btn_0.active = false;
            btn_1.active = true;
        }

        if(1 == this.item_data.status){
            btn_2.active = true;
            btn_3.active = false;
            if(!btn_0.getComponent(cc.Button).interactable) btn_0.getComponent(cc.Button).interactable = true;
            if(2 == cc.hallControl.club_level) btn_2.getComponent(cc.Button).interactable = false;
        }else if(2 == this.item_data.status){
            btn_2.active = false;
            btn_3.active = true;
            if(btn_0.getComponent(cc.Button).interactable) btn_0.getComponent(cc.Button).interactable = false;
            if(!btn_2.getComponent(cc.Button).interactable) btn_2.getComponent(cc.Button).interactable = true;
        }
    },

    /**
     * 调整玩家状态: 1普通成员，2管理员
     */
    dealWith: function (num) {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.item_data.club_id,
            "uid": this.item_data.mid,
            "status": num
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_user_set", postData, this.treatReturnData.bind(this));
    },

    /**
     * 解禁
     */
    closeJin: function () {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.item_data.club_id,
            "uid": this.item_data.mid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_tuichu", postData, this.treatReturnData.bind(this));
    },

    /**
     * 踢人
     */
    exitClub: function () {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.item_data.club_id,
            "uid": this.item_data.mid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_tuichu", postData, this.treatReturnData.bind(this));
    },

    treatReturnData:function(data){
        cc.log(data);
        if(data.msg) cc.hallControl.showMsg(data.msg);
        if (1 == data.status) {
            let show = this.node.getChildByName("btn_pop");
            show.active = false;
            this.sendUser();
        }
    }
});
