cc.Class({
    extends: cc.Component,

    properties: {
        item_0: cc.Prefab,
        item_1: cc.Prefab,
        sprite_arr: [cc.SpriteFrame]
    },

    onLoad () {
        //this.onOpenView();
        this.list_page_0 = 1;
        this.list_page_1 = 1;
    },

    onOpenView: function (compent) {
        this.isShowing = true;
        this.com = compent;
        let tog = cc.find("toggleGroup/toggle1",this.node).getComponent(cc.Toggle);
        let node_0 = this.node.getChildByName("scrollView_bang");
        let node_1 = this.node.getChildByName("scrollView_geren");
        if(tog.isChecked){
            node_0.active = true;
            node_1.active = false;
            let lab = cc.find("scrollView_bang/bottom_bg/lab_num",this.node).getComponent(cc.Label);
            if(lab.string == "当前排行榜"){
                this.sendUser(1);
            }else{
                this.sendUser(2);
            }
        }else{
            node_0.active = false;
            node_1.active = true;
            this.sendJoin();
        }

        this.node.active = true;
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
                break;
            }
            case 'up'://展开
            {
                let btn = cc.find("scrollView_bang/bottom_bg/btn3",this.node);
                btn.active = false;
                let show = cc.find("scrollView_bang/bottom_bg/scrollView",this.node);
                show.active = true;
                break;
            }
            case 'down'://关闭
            {
                let show = cc.find("scrollView_bang/bottom_bg/scrollView",this.node);
                show.active = false;
                let btn = cc.find("scrollView_bang/bottom_bg/btn3",this.node);
                btn.active = true;
                break;
            }
            case 'refresh'://刷新
            {
                this.sendJoin();
                break;
            }
            case 'search'://查询
            {
                this.searchUser();
                break;
            }
            case '1':
            case '2':
            {
                let show = cc.find("scrollView_bang/bottom_bg/scrollView",this.node);
                show.active = false;
                let btn = cc.find("scrollView_bang/bottom_bg/btn3",this.node);
                btn.active = true;
                let lab = cc.find("scrollView_bang/bottom_bg/lab_num",this.node).getComponent(cc.Label);
                if(1 == type){
                    lab.string = "当前排行榜"
                }else{
                    lab.string = "上周排行榜"
                }
                this.sendUser(type);
                break;
            }
        }
    },

    changeNode:function(){
        let node_0 = this.node.getChildByName("scrollView_bang");
        let node_1 = this.node.getChildByName("scrollView_geren");

        if(node_0.active){
            node_0.active = false;
            node_1.active = true;
            this.sendJoin();
        }else{
            node_0.active = true;
            node_1.active = false;
            let lab = cc.find("scrollView_bang/bottom_bg/lab_num",this.node).getComponent(cc.Label);
            if(lab.string == "当前排行榜"){
                this.sendUser(1);
            }else{
                this.sendUser(2);
            }
        }
    },

    /**
     * 请求俱乐部积分榜数据
     */
    sendUser: function (num) {
        //var timestamp = (new Date()).valueOf();
        var postData = {
            "type": num,
            "page": this.list_page_0,
            "club_id": this.com.club_data.id
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_jifen", postData, this.onReturnUser.bind(this));
    },

    /**
     * 请求个人积分数据
     */
    sendJoin: function () {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.com.club_data.id,
            "page": this.list_page_1
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_jifen_mid", postData, this.onReturnJoin.bind(this));
    },

    /**
     * 查询玩家积分详情
     */
    searchUser: function () {
        let lab = cc.find("scrollView_geren/bottom_bg/editBox",this.node).getComponent(cc.EditBox);
        //var postData = {
        //    "type": 1,
        //    "mid": parseInt(lab.string),
        //    "club_id": this.com.club_data.id
        //};
        //let url = cc.vv.http.URL;
        //cc.vv.http.sendRequest(url + "club_search_jifen", postData, this.onReturnJoin.bind(this));
        var postData = {
            "mid": parseInt(lab.string),
            "club_id": this.com.club_data.id,
            "page": this.list_page_1
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_jifen_mid", postData, this.onReturnJoin.bind(this));
        lab.string = "";
    },

    /**
     * 处理俱乐部积分榜数据
     */
    onReturnUser: function (data) {
        cc.log(data);
        if (data.status == 1) {
            // this.initView(index);
            let arr = data.data;
            let content = cc.find("scrollView_bang/view/content",this.node);
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
                    this.showItem_0(item,arr[i],i);
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
     * 显示积分榜item数据
     */
    showItem_0: function (node,data,index) {
        let spr = node.getChildByName("rank").getComponent(cc.Sprite);
        let lab0 = node.getChildByName("label_name").getComponent(cc.Label);
        let lab1 = node.getChildByName("label_id").getComponent(cc.Label);
        let lab2 = node.getChildByName("label_ji").getComponent(cc.Label);
        let lab3 = node.getChildByName("label_rank").getComponent(cc.Label);

        if(3 > index){
            spr.node.active = true;
            lab3.node.active = false;
            spr.spriteFrame = this.sprite_arr[index]
        }else{
            lab3.node.active = true;
            spr.node.active = false;
            lab0.string = index;
        }

        let userName = cc.vv.Global.getNameThree(data.nickname);
        lab0.string = userName;
        lab1.string = data.id;
        lab2.string = data.score;
    },

    /**
     * 处理个人积分数据
     */
    onReturnJoin: function (data) {
        if (data.status == 1) {
            cc.log(data);
            //cc.hallControl.showMsg("查询成功，玩家积分已显示。");
            // this.initView(index);
            let arr = data.data;

            let content = cc.find("scrollView_geren/view/content",this.node);
            let lab_0 = cc.find("scrollView_geren/bottom_bg/label_name",this.node).getComponent(cc.Label);
            let lab_1 = cc.find("scrollView_geren/bottom_bg/label_id",this.node).getComponent(cc.Label);
            let lab_2 = cc.find("scrollView_geren/bottom_bg/label_ranking",this.node).getComponent(cc.Label);
            lab_0.string = "玩家昵称: " + arr[0].nickname;
            lab_1.string = "ID: " + arr[0].id;
            lab_2.string = "当前积分排名: " + data.rank;
            let item_prefab = this.item_1;
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
                    this.showItem_1(item,arr[i]);
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
     * 显示个人积分item数据
     */
    showItem_1: function (node,data) {
        let lab0 = node.getChildByName("label_time").getComponent(cc.Label);
        let lab1 = node.getChildByName("label_ji").getComponent(cc.Label);
        lab0.string = data.date;
        lab1.string = data.score;
    }
});
