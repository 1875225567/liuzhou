cc.Class({
    extends: cc.Component,

    properties: {
        item_0: cc.Prefab,
        item_1: cc.Prefab,
        item_2: cc.Prefab,
        item_3: cc.Prefab
    },

    onLoad () {
        this.item_date = null;
        this.onOpenView();
    },

    onOpenView: function () {
        //this.isShowing = true;
        //this.club_data = data;
        this.getClub();
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'back':
            {
                this.node.active = false;
                break;
            }
            case 'refresh':
            {
                this.getClub();
                break;
            }
            case 'tog':
            {
                let node_0 = cc.find("pop_node/node_0",this.node);
                let node_1 = cc.find("pop_node/node_1",this.node);
                if(node_1.active){
                    node_0.active = true;
                    node_1.active = false;
                }else{
                    node_0.active = false;
                    node_1.active = true;
                }
                break;
            }
            case 'pop_close':
            {
                let label = cc.find("pop_node/node_1/scrollView/lab_num",this.node).getComponent(cc.Label);
                label.string = "所有";
                let pop = this.node.getChildByName("pop_node");
                pop.active = false;
                break;
            }
            case 'record_close':
            {
                //let label = cc.find("pop_node/node_1/scrollView/lab_num",this.node).getComponent(cc.Label);
                //label.string = "所有";
                let pop = this.node.getChildByName("record");
                pop.active = false;
                break;
            }
            case 'view_close':
            {
                let record = cc.find("record/view1",this.node);
                record.active = false;
                break;
            }
            case 'down'://关闭
            case 'up'://展开
            {
                let btn = cc.find("pop_node/node_1/scrollView/btn3",this.node);
                let show = cc.find("pop_node/node_1/scrollView/scrollView",this.node);
                if(btn.active){
                    btn.active = false;
                    show.active = true;
                }else{
                    show.active = false;
                    btn.active = true;
                }
                break;
            }
            case '所有':
            case '5分及以上':
            case '6分及以上':
            case '8分及以上':
            case '10分及以上':
            {
                let show = cc.find("pop_node/node_1/scrollView/scrollView",this.node);
                show.active = false;
                let label = cc.find("pop_node/node_1/scrollView/lab_num",this.node).getComponent(cc.Label);
                label.string = type.toString();
                let btn = cc.find("pop_node/node_1/scrollView/btn3",this.node);
                btn.active = true;

                let pos = type.toString().indexOf("分");
                let num = 0;
                if(-1 != pos){
                    let str = type.toString().substring(0,pos);
                    num = parseInt(str);
                }
                this.joinRoom(num);
                break;
            }
        }
    },

    /**
     * 获取场次统计数据
     */
    getClub: function () {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": cc.clubControl.club_data.id
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_count", postData, this.dealClubRoomData.bind(this));
    },

    dealClubRoomData:function(data){
        cc.log(data);
        if(1 == data.status){
            let content = cc.find("scrollView/view/content",this.node);
            let arr = data.data;
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
                    let js = item.getComponent('item_list_p');
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

    dealForm:function(data,index){
        cc.log(data);
        let pop = this.node.getChildByName("pop_node");
        pop.active = true;
        let node_0 = cc.find("pop_node/node_0",this.node);
        let node_1 = cc.find("pop_node/node_1",this.node);
        let tog_0 = cc.find("pop_node/toggleGroup/toggle1",this.node).getComponent(cc.Toggle);
        let tog_1 = cc.find("pop_node/toggleGroup/toggle2",this.node).getComponent(cc.Toggle);
        if(0 == index){
            tog_0.isChecked = true;
            tog_1.isChecked = false;
            node_0.active = true;
            node_1.active = false;
        }else{
            tog_0.isChecked = false;
            tog_1.isChecked = true;
            node_0.active = false;
            node_1.active = true;
        }

        let label_time = node_0.getChildByName("label_time").getComponent(cc.Label);
        let label_id = node_0.getChildByName("label_id").getComponent(cc.Label);
        label_time.string = this.item_date;
        label_id.string = "ID: " + cc.clubControl.club_data.id;
        for (let i = 0; i < data.detail.length; ++i) {
            let label = node_0.getChildByName("label_" + i).getComponent(cc.Label);
            label.string = data.detail[i];
        }

        let content = cc.find("scrollView/view/content",node_1);
        let arr = data.win;
        let item_prefab = this.item_1;
        let child_arr = content.children;
        let child_len = content.childrenCount;
        let len = arr.length;
        let max_len = Math.max(len, child_len);
        for (let i = 0; i < max_len; ++i) {
            let item = null;
            if (len && i < len) {
                if (i < child_len) {
                    item = child_arr[i];
                    item.active = true;
                } else {
                    item = cc.instantiate(item_prefab);
                    item.parent = content;
                }
                let js = item.getComponent('item_list_p_0');
                js.onOpenView(arr[i],this);
            } else {
                if (i < child_len) {
                    item = child_arr[i];
                    item.active = false;
                }
            }
        }
    },

    /**
     * 大赢家
     */
    joinRoom: function (num) {
        var postData = {
            'date': this.item_date,
            "club_id": cc.clubControl.club_data.id,
            'fen': num
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_count_detail", postData, function(data){
            this.dealForm(data,1)
        }.bind(this));
    },

    dealRecord:function(data){
        cc.log(data);
        let record = this.node.getChildByName("record");
        record.active = true;

        let content = cc.find("record/view0/view/content",this.node);
        let arr = data.data;
        let item_prefab = this.item_2;
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
                let js = item.getComponent('item_list_p_1');
                js.onOpenView(arr[i],this);
            } else {
                if (i < child_len) {
                    item = child_arr[i];
                    item.active = false;
                }
            }
        }
    },

    dealXiang:function(data){
        cc.log(data);
        let record = cc.find("record/view1",this.node);
        record.active = true;

        let content = cc.find("record/view1/view/content",this.node);
        let arr = data.data;
        let item_prefab = this.item_3;
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
                let js = item.getComponent('item_list_p_2');
                js.onOpenView(arr[i],this,i + 1);
            } else {
                if (i < child_len) {
                    item = child_arr[i];
                    item.active = false;
                }
            }
        }
    },


});
