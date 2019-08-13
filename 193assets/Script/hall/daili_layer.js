cc.Class({
    extends: cc.Component,

    properties: {
        item_0: cc.Prefab
    },

     onLoad () {
         this.onOpenView();
     },

    onOpenView: function () {
        let lab_0 = cc.find("roomlist/view_0/view_0/lab_0",this.node).getComponent(cc.Label);
        let lab_1 = cc.find("roomlist/view_0/view_0/lab_1",this.node).getComponent(cc.Label);
        let lab_2 = cc.find("roomlist/view_0/view_0/lab_2",this.node).getComponent(cc.Label);
        let lab_3 = cc.find("roomlist/view_0/view_0/lab_3",this.node).getComponent(cc.Label);
        let lab_4 = cc.find("roomlist/view_0/view_0/lab_4",this.node).getComponent(cc.Label);

        let userName = cc.vv.Global.getNameStr(cc.hallControl.member_data.nickname);
        lab_0.string = userName;
        lab_1.string = cc.hallControl.member_data.num;
        lab_2.string = cc.hallControl.member_data.id;
        lab_3.string = cc.hallControl.member_data.fan;
        lab_4.string = cc.hallControl.member_data.win;

        let btn = cc.find("toggleGroup/toggle1",this.node);
        if(4 == cc.vv.userData.user_level){
            if(!btn.active) btn.active = true;
        }else{
            if(btn.active) btn.active = false;
        }
        this.changeView();

        let head = cc.find("roomlist/view_0/view_0/head",this.node);
        cc.hallControl.loadHeadTexture(head,cc.hallControl.member_data.headimgurl);
    },

    changeView:function(){
        for(let i = 0; i < 4; i++){
            let tog = cc.find("toggleGroup/toggle" + i,this.node).getComponent(cc.Toggle);
            let node = cc.find("roomlist/view_" + i,this.node);
            if(tog.isChecked){
                node.active = true;
                if(2 == i){
                    this.RefreshAgentData();
                }
            }else{
                node.active = false;
            }
        }
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'back':
            {
                this.node.active = false;
                let lab_0 = cc.find("roomlist/view_1/editBox_1",this.node).getComponent(cc.EditBox);
                if("" != lab_0.string) lab_0.string = "";
                break;
            }
            //case 'view_0':
            //{
            //    let tog = cc.find("roomlist/view_0/toggleGroup/toggle1",this.node).getComponent(cc.Toggle);
            //    let node_0 = cc.find("roomlist/view_0/view_0",this.node);
            //    let node_1 = cc.find("roomlist/view_0/view_1",this.node);
            //    if(tog.isChecked){
            //        node_0.active = true;
            //        node_1.active = false;
            //    }else{
            //        node_0.active = false;
            //        node_1.active = true;
            //    }
            //    break;
            //}
            case 'view_2':
            {
                //let tog = cc.find("roomlist/view_2/toggleGroup/toggle1",this.node).getComponent(cc.Toggle);
                let node_0 = cc.find("roomlist/view_2/scrollView_0",this.node);
                //let node_1 = cc.find("roomlist/view_2/scrollView_1",this.node);
                //if(tog.isChecked){
                    node_0.active = true;
                //    node_1.active = false;
                //}else{
                //    node_0.active = false;
                //    node_1.active = true;
                //}
                break;
            }
            case 'dai_zhan':
            {
                let node_0 = cc.find("roomlist/view_2/scrollView_0",this.node);
                node_0.active = false;
                cc.hallControl.showZhanji("dai");
                break;
            }
            case 'get_fan':
            {
                let postData = {
                    "mid": cc.vv.userData.mid
                };
                let url = cc.vv.http.URL;
                cc.vv.http.sendRequest(url + "agent_lingqu", postData, this.returnFanData.bind(this));
                break;
            }
            case 'zeng':
            {
                let lab_0 = cc.find("roomlist/view_1/editBox_0",this.node).getComponent(cc.EditBox);
                let lab_1 = cc.find("roomlist/view_1/editBox_1",this.node).getComponent(cc.EditBox);
                let postData = {
                    "mid": cc.vv.userData.mid,
                    "uid": lab_1.string,
                    "num": lab_0.string
                };
                let url = cc.vv.http.URL;
                cc.vv.http.sendRequest(url + "agent_giving", postData, this.returnZengData.bind(this));
                break;
            }
            case 'down':
            case 'up':
            {
                let lab_0 = cc.find("roomlist/view_1/editBox_0",this.node).getComponent(cc.EditBox);
                let num = 0;
                if("" != lab_0.string) num = parseInt(lab_0.string);
                if("down" == type) num -= 1;
                else num += 1;
                if(0 > num) num = 0;
                lab_0.string = num.toString();
                break;
            }
            case 'daikai':
            {
                let lab_0 = cc.find("roomlist/view_2/icon/EditBox",this.node).getComponent(cc.EditBox);
                cc.hallControl.daili_shu = lab_0.string;
                cc.hallControl.daili_call = this.daikaiRoom;
                cc.hallControl.onToggleView("create_layer");
                this.schedule(this.doCountdownTime,1);
                break;
            }
        }
    },

    //倒计时
    doCountdownTime:function(){
        if(!cc.hallControl.create_layer.active){
            this.RefreshAgentData();
            this.unschedule(this.doCountdownTime);
        }
    },

    RefreshAgentData:function(){
        let postData = {
            "mid": cc.vv.userData.mid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "agent_room_list", postData, this.returnAgentData.bind(this));
    },

    /**
     * 赠送钻石返回
     * @param data
     */
    returnZengData:function(data){
        cc.log(data);
        let lab_0 = cc.find("roomlist/view_1/editBox_0",this.node).getComponent(cc.EditBox);
        lab_0.string = "";
        if(data.msg) cc.loadingControl.showMsg(data.msg);
    },

    /**
     * 领取返钻返回
     * @param data
     */
    returnFanData:function(data){
        cc.log(data);
        if(data.msg) cc.loadingControl.showMsg(data.msg);
    },

    returnAgentData:function(data){
        cc.log(data);
        if(1 == data.status){
            let content = cc.find("roomlist/view_2/scrollView_0/view/content",this.node);
            //let arr = data.data.data;
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
                    let js = item.getComponent('item_d0');
                    js.onOpenView(arr[i],this);
                } else {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = false;
                    }
                }
            }
        }
        if(data.msg) cc.loadingControl.showMsg(data.msg);
    },

    /**
     * 强制输入框只能输入数字
     * @param str 玩家实时输入的字符串
     * @param lab 输入框
     */
    testNumber_0:function(str,lab){
        let number = cc.vv.Global.isNumber(str);
        lab.string = number;
    },

    daikaiRoom:function(postData){
        cc.hallControl.daili_call = null;
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "agent_create_room", postData, function(data){
            cc.log(data);
            if(1 == data.status){
                cc.hallControl.create_layer.active = false;
            }
        });
    }
});
