/**
 * 邀请码
 */
cc.Class({
    extends: cc.Component,

    properties: {
        item:cc.Prefab,
        item_record:cc.Prefab
    },

    ctor: function () {
        //this.bindStatus = false;
        this.gift_type1 = [];
        this.gift_type2 = [];
    },

    onLoad: function () {
        this.onOpenView();
    },

    onOpenView: function () {
        this.initView();
        this.loadViewData();

        this.node.active = true;
    },

    loadViewData:function(){
        let lab_0 = cc.find("top_bg/diamon_bg/lab",this.node).getComponent(cc.Label);
        let lab_1 = cc.find("top_bg/ji_bg/lab",this.node).getComponent(cc.Label);
        lab_0.string = cc.vv.userData.num;
        lab_1.string = cc.hallControl.win_number;
    },

    initView:function(){
        var postData = {
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "gifts", postData, this.onReturnData.bind(this));
    },

    onReturnData: function (data) {
        cc.log(data);
        if(1 == data.status){
            this.gift_type1 = [];
            this.gift_type2 = [];
            let arr = data.data;
            for(let i = 0; i < arr.length; i++){
                let item = arr[i];
                if(1 == item.type){
                    this.gift_type1.push(item);
                }else if(2 == item.type){
                    this.gift_type2.push(item);
                }
            }

            this.loadView();
        }
    },

    loadView: function () {
        let node_0 = cc.find("gift_bg/scrollView_0",this.node);
        let node_1 = cc.find("gift_bg/scrollView_1",this.node);
        let content,arr;
        if(node_0.active){
            content = cc.find("view/content",node_0);
            arr = this.gift_type1;
        }else{
            content = cc.find("view/content",node_1);
            arr = this.gift_type2;
        }

        let item_prefab = this.item;
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
                let js = item.getComponent("gift_item");
                js.onOpenView(arr[i],this)
            } else {
                if (i < child_len) {
                    item = child_arr[i];
                    item.active = false;
                }
            }
        }
    },

    onClickView: function () {
        this.isShowing = true;
        this.node.active = false;
    },

    onDestroy: function () {
        //cc.loader.setAutoReleaseRecursively('Prefab/hall/share_layer', true);
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'type_change':
            {
                let node_0 = cc.find("gift_bg/scrollView_0",this.node);
                let node_1 = cc.find("gift_bg/scrollView_1",this.node);
                if(node_0.active){
                    node_0.active = false;
                    node_1.active = true;
                }else{
                    node_1.active = false;
                    node_0.active = true;
                }
                this.initView();
                break;
            }
            case 'help':
            {
                let help = this.node.getChildByName("helpMsg");
                if(help.active){
                    help.active = false;
                }else{
                    help.active = true;
                }
                break;
            }
            case 'adresss':
            {
                let adress = this.node.getChildByName("adress");
                if(adress.active){
                    adress.active = false;
                    return;
                }else{
                    adress.active = true;
                }
                let postData = {
                    mid: cc.vv.userData.mid
                };
                let url = cc.vv.http.URL;
                cc.vv.http.sendRequest(url + "get_address", postData, this.onAdressData.bind(this));
                break;
            }
            case 'jilu':
            {
                let adress = this.node.getChildByName("recording");
                if(adress.active){
                    adress.active = false;
                    return;
                }else{
                    adress.active = true;
                }
                let postData = {
                    mid: cc.vv.userData.mid
                };
                let url = cc.vv.http.URL;
                cc.vv.http.sendRequest(url + "my_exchange", postData, this.onRecordData.bind(this));
                break;
            }
            case 'change':
            {
                let name = cc.find("adress/editBox_0",this.node).getComponent(cc.EditBox);
                let phone = cc.find("adress/editBox_1",this.node).getComponent(cc.EditBox);
                let adress = cc.find("adress/editBox_2",this.node).getComponent(cc.EditBox);
                let postData = {
                    mid: cc.vv.userData.mid,
                    name: name.string,
                    phone: phone.string,
                    address: adress.string
                };
                let url = cc.vv.http.URL;
                cc.vv.http.sendRequest(url + "save_address", postData, function(data){
                    cc.loadingControl.showMsg(data.msg);
                }.bind(this));
                break;
            }
        }
    },

    onAdressData:function(data){
        cc.log(data);
        if(1 == data.status && data.data){
            let name = cc.find("adress/editBox_0",this.node).getComponent(cc.EditBox);
            let phone = cc.find("adress/editBox_1",this.node).getComponent(cc.EditBox);
            let adress = cc.find("adress/editBox_2",this.node).getComponent(cc.EditBox);

            name.string = data.data.name;
            phone.string = data.data.phone;
            adress.string = data.data.address;
        }
    },

    onRecordData:function(data){
        cc.log(data);
        if(1 == data.status && data.data){
            let content = cc.find("recording/scrollView/view/content",this.node);
            let arr = data.data;

            let item_prefab = this.item_record;
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
                    this.showItem(item,arr[i])
                } else {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = false;
                    }
                }
            }
        }
    },

    showItem:function(node,data){
        let lab_0 = node.getChildByName("label_time").getComponent(cc.Label);
        let lab_1 = node.getChildByName("label_gift").getComponent(cc.Label);
        let lab_2 = node.getChildByName("label_money").getComponent(cc.Label);

        let time = data.created_at.slice(5,16);
        lab_0.string = time;
        lab_1.string = data.gift.name + data.gift.unit;
        lab_2.string = data.gift.price;
    },

    sendBind:function () {
        let pid = parseInt(this.code_edit.string);
        var postData = {
            "mid":cc.vv.userData.mid,
            "pid":pid
        };
        cc.vv.http.sendRequest(cc.vv.http.bind_url,postData,this.onReturnBind.bind(this));
    },

    onReturnBind:function(data){
        if(data.status == 1){
            this.bindStatus = true;
            this.onClickView();
        }else{
            cc.loadingControl.showMsg(data.msg);
        }
    }
});