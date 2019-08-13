cc.Class({
    extends: cc.Component,

    properties: {
        item_0: cc.Prefab
    },

    onLoad () {
        //this.onOpenView();
    },

    onOpenView: function (data) {
        this.isShowing = true;
        this.club_data = data;
        //this.com = compent;
        let btn_0 = cc.find("node_0/btn_disband",this.node);
        let btn_1 = cc.find("node_0/btn_exit",this.node);
        let btn_2 = cc.find("node_0/btn_set",this.node);
        let btn_3 = cc.find("node_0/btn_save",this.node);
        if(3 == cc.hallControl.club_level){
            btn_0.active = true;
            btn_2.active = true;
            btn_3.active = true;
            btn_1.active = false;
        }else{
            btn_0.active = false;
            btn_2.active = false;
            btn_3.active = false;
            btn_1.active = true;
        }

        let label_0 = cc.find("node_0/label_name",this.node).getComponent(cc.Label);
        let label_1 = cc.find("node_0/label_number",this.node).getComponent(cc.Label);
        let label_2 = cc.find("node_0/label_chuang",this.node).getComponent(cc.Label);
        let label_3 = cc.find("node_0/label_id",this.node).getComponent(cc.Label);
        label_0.string = cc.vv.Global.getNameStr(data.name);
        label_1.string = "成员: " + data.zaixian + "/" + data.renshu;
        label_2.string = "创始人: " + cc.vv.Global.getNameStr(data.leader_name);
        label_3.string = "俱乐部ID: " + data.id;
        this.node.active = true;
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'set':
            {
                this.changeNode();
                break;
            }
            case 'jiesan':
            {
                cc.loadingControl.onToggleView('notice_layer', "您确定要解散俱乐部？", this.jiesanClub.bind(this));
                break;
            }
            case 'tuichu':
            {
                cc.loadingControl.onToggleView('notice_layer', "您确定要退出俱乐部？", this.exitClub.bind(this));
                break;
            }
            case 'back':
            {
                this.node.active = false;
                break;
            }
            case 'save':
            {
                this.saveGong();
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
            case 'cha':
            case 'jing':
            {
                cc.clubControl.changeClubShow();
                break;
            }
            case 'change_view':
            {
                let node_0 = this.node.getChildByName("change_name");

                if(node_0.active){
                    node_0.active = false;
                    let lab = cc.find("change_name/editBox",this.node).getComponent(cc.EditBox);
                    lab.string = "";
                }else{
                    node_0.active = true;
                }
                break;
            }
            case 'changeName':
            {
                cc.loadingControl.onToggleView('notice_layer', "您确定消耗500钻石改名？", this.changeNameCallback.bind(this));
                break;
            }
            case 'node_0':
            case 'node_1':
            case 'node_2':
            {
                let num = parseInt(type[type.length - 1]);
                this.changeNodeShow(num);
                break;
            }
        }
    },

    /**
     * 切换node显示
     * @param num 要显示的node编号
     */
    changeNodeShow:function(num){
        for(let i = 0; i < 3; i++){
            let node = this.node.getChildByName("node_" + i);
            if(i == num){
                node.active = true;
            }else{
                node.active = false;
            }
        }

        if(1 == num){
            let postData = {
                "mid": cc.vv.userData.mid,
                "club_id": this.club_data.id,
                "page": 1
            };
            let url = cc.vv.http.URL;
            cc.vv.http.sendRequest(url + "club_logs", postData, this.dealLogs.bind(this));
        }else if(2 == num){
            let tog_1 = cc.find("node_2/toggleGroup/toggle1",this.node).getComponent(cc.Toggle);
            let tog_2 = cc.find("node_2/toggleGroup/toggle2",this.node).getComponent(cc.Toggle);
            if("teaHouseEdition" == cc.clubControl.show_node.name){
                tog_1.isChecked = true;
                tog_2.isChecked = false;
            }else{
                tog_1.isChecked = false;
                tog_2.isChecked = true;
            }
        }
    },

    /**
     * 保存公告
     */
    saveGong: function () {
        let lab = cc.find("node_0/editBox",this.node).getComponent(cc.EditBox);
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.club_data.id,
            "gonggao": lab.string
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_update", postData, function(data){
            cc.log(data);
            if(data.msg) cc.hallControl.showMsg(data.msg);
            if(1 == data.status){
                cc.clubControl.showLaba(lab.string);
                lab.string = "";
            }
        }.bind(this));
    },

    /**
     * 解散俱乐部
     */
    jiesanClub: function () {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.club_data.id
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_jiesan", postData, function(data){
            cc.log(data);
            if(data.msg) cc.hallControl.showMsg(data.msg);
            if(1 == data.status){
                cc.clubControl.closeClub();
            }
        }.bind(this));
    },

    /**
     * 退出俱乐部
     */
    exitClub: function () {
        var postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.club_data.id,
            "uid": cc.vv.userData.mid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "club_tuichu", postData, function(data){
            cc.log(data);
            if(data.msg) cc.hallControl.showMsg(data.msg);
            if(1 == data.status){
                cc.clubControl.closeClub();
            }
        }.bind(this));
    },

    /**
     * 修改俱乐部名字
     */
    changeNameCallback:function(){
        let lab = cc.find("change_name/editBox",this.node).getComponent(cc.EditBox);
        let postData = {
            "mid": cc.vv.userData.mid,
            "club_id": this.club_data.id,
            "name": lab.string
        };
        let url = cc.vv.http.URL;

        cc.vv.http.sendRequest(url + "club_rename", postData, function(data){
            if(data.msg) cc.hallControl.showMsg(data.msg);
            cc.log(data);
            if(1 == data.status){
                let label_0 = cc.find("node_0/label_name",this.node).getComponent(cc.Label);
                label_0.string = lab.string;
                cc.clubControl.changeName(lab.string,data.num);
                lab.string = ""
            }
        }.bind(this));
    },

    /**
     * 显示俱乐部日志信息
     * @param data 回调的数据
     */
    dealLogs:function(data){
        cc.log(data);
        if(1 == data.status){
            let content = cc.find("node_1/scrollView/view/content",this.node);
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
                    let label = item.getChildByName('label').getComponent(cc.Label);
                    label.string = arr[i].content;
                } else {
                    if (i < child_len) {
                        item = child_arr[i];
                        item.active = false;
                    }
                }
            }
        }
    }

});
