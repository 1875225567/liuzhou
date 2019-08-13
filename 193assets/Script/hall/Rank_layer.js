/**
 * 排行榜
 */
cc.Class({
    extends: cc.Component,

    properties: {
        scrollView_0: cc.Node,
        scrollView_1: cc.Node,
        content_0: cc.Node,
        content_1: cc.Node,
        item_prefab: cc.Prefab,
        level_arr: [cc.SpriteFrame]
    },

    ctor: function () {
        //this.isShowing = false;
        this.page_0 = 1;
        this.page_1 = 1;
        this.list_data_0 = null;
        this.list_data_1 = null;
    },

    onLoad: function () {
        this.onOpenView();
        //this.scrollView_0.on('scroll-to-top', function(){
        //    cc.log('scroll-to-top')
        //}, this);
        //this.scrollView_0.on('scroll-to-bottom', function(){
        //    cc.log('scroll-to-bottom')
        //}, this);
        //this.scrollView_0.on('scroll-to-left', function(){
        //    cc.log('scroll-to-left')
        //}, this);
        //this.scrollView_0.on('scroll-to-right', function(){
        //    cc.log('scroll-to-right')
        //}, this);
        //this.scrollView_0.on('scrolling', function(){
        //    cc.log('scrolling')
        //}, this);
        //this.scrollView_0.on('bounce-top', function(){
        //    cc.log('bounce-top')
        //}, this);
        //this.scrollView_0.on('bounce-left', function(){
        //    cc.log('bounce-left')
        //}, this);
        //this.scrollView_0.on('bounce-right', function(){
        //    cc.log('bounce-right')
        //}, this);
        //this.scrollView_0.on('touch-up', function(){
        //    cc.log('touch-up')
        //}, this);
        //this.scrollView_0.on('scroll-began', function(event){
        //    cc.log('scroll-began',event)
        //}, this);
        //this.scrollView_0.on('scroll-ended', function(event){
        //    cc.log('scroll-ended',event)
        //}, this);
        //this.scrollView_0.on('bounce-bottom', function(){
        //    //cc.log('bounce-bottom');
        //    this.paginaControl();
        //}, this);
        //this.scrollView_0.on('touchend', function(event){
        //    let newY = event.getLocationY();
        //    let oldY = event.getStartLocation().y;
        //    let num = newY - oldY;
        //    //cc.log(event.getLocationY(),event.getStartLocation(),newY - oldY);
        //    if(0 > num){
        //        this.paginaControl(num);
        //    }
        //}, this);
    },

    onOpenView: function () {
        //this.isShowing = true;
        //var bg = this.node.getChildByName('bg');
        //bg.scale = 0;
        //bg.runAction(cc.sequence(
        //    //cc.spawn(cc.fadeIn(0.3),cc.scaleTo(0.3, 1).easing(cc.easeBackOut())),
        //    cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
        //    cc.callFunc(function () {
        //        this.isShowing = false;
        //    }.bind(this))
        //));
        this.changeView();
        this.getRankMonth();//月榜
        this.getRankYear();//年榜
    },

    /**
     * 切换分页按钮的显示与否
     */
    paginaControl: function (num) {
        let pag;
        if(this.scrollView_0.active){
            pag = this.scrollView_0.getChildByName("btn_pagination");
        }else{
            pag = this.scrollView_1.getChildByName("btn_pagination");
        }

        if(num && pag.active){
            pag.active = false;
        }else if(!num && !pag.active){
            //this.refreshLab();
            pag.active = true;
        }
    },

    changeView:function(){
        let tog_1 = cc.find("bg/toggleGroup/toggle1",this.node).getComponent(cc.Toggle);
        if(tog_1.isChecked){
            this.scrollView_0.active = true;
            this.scrollView_1.active = false;
        }else{
            this.scrollView_0.active = false;
            this.scrollView_1.active = true;
        }
    },

    refreshLab:function(num){
        let lab,max_num;
        if(this.scrollView_0.active){
            lab = cc.find("btn_pagination/label",this.scrollView_0).getComponent(cc.Label);
            max_num = this.page_0;
        }else{
            lab = cc.find("btn_pagination/label",this.scrollView_1).getComponent(cc.Label);
            max_num = this.page_1;
        }

        lab.string = num + "/" + max_num;
    },

    onClickView: function () {
        //this.isShowing = true;
        //var bg = this.node.getChildByName('bg');
        //bg.scale = 1;
        //bg.runAction(cc.sequence(
        //    //cc.spawn(cc.fadeOut(0.3),cc.scaleTo(0.3, 0).easing(cc.easeBackOut())),
        //    cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
        //    cc.callFunc(function () {
        //        this.isShowing = false;
                this.node.active = false;
        //    }.bind(this))
        //));
    },

    getRankMonth: function () {
        var postData = {
            "mid": cc.vv.userData.mid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "month_rank", postData, function(data){
            console.log(data);
            if (data.status == 1) {
                this.list_data_0 = data;
                this.page_0 = Math.ceil(data.data.length / 10);
                this.updateView(0);
            } else {
                cc.loadingControl.showMsg(data.msg);
            }
        }.bind(this));
    },

    getRankYear: function () {
        var postData = {
            "mid": cc.vv.userData.mid
        };
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "year_rank", postData, function(data){
            console.log(data);
            if (data.status == 1) {
                this.list_data_1 = data;
                this.page_1 = Math.ceil(data.data.length / 10);
                this.updateView(0,"year");
            } else {
                cc.loadingControl.showMsg(data.msg);
            }
        }.bind(this));
    },

    onDestroy: function () {

    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'left':
            case 'right':
            {
                this.refPage(type);
                break;
            }
            case 'back':
            {
                this.onClickView();
                break;
            }
            case 'check':
            {
                this.changeView();
                break;
            }
        }
    },

    refPage:function(str){
        let lab,max_num;
        if(this.scrollView_0.active){
            lab = cc.find("btn_pagination/label",this.scrollView_0).getComponent(cc.Label);
            max_num = this.page_0
        }else{
            lab = cc.find("btn_pagination/label",this.scrollView_1).getComponent(cc.Label);
            max_num = this.page_1
        }
        let num = parseInt(lab.string[0]);

        if("left" == str){
            if(2 > num) return;
            num -= 2;
            this.updateView(num)
        }else{
            if(max_num <= num) return;
            this.updateView(num)
        }
    },

    /**
     * 更新界面
     *  月榜  年榜
     */
    updateView: function (num,str) {
        let arr, content, len, my_rank;
        if(this.scrollView_0.active && !str){
            arr = this.list_data_0;
            len = arr.data.length;
            content = this.content_0;
            my_rank = this.scrollView_0.getChildByName("rank_item")
        }else{
            arr = this.list_data_1;
            len = arr.data.length;
            //this.page_1 = Math.ceil(len / 10);
            content = this.content_1;
            my_rank = this.scrollView_1.getChildByName("rank_item")
        }

        this.refreshLab(num + 1);
        let number = num * 10 + 10;
        let child_arr = content.children;
        let child_len = content.childrenCount;
        let j = 0;
        for (let i = num * 10; i < number; ++i) {
            let item = null;
            if (len && i < len) {
                if (j < child_len) {
                    item = child_arr[j];
                    item.active = true;
                } else {
                    item = cc.instantiate(this.item_prefab);
                    item.parent = content;
                }
                this.showItem(item, arr.data[i]);
            } else {
                if (j < child_len) {
                    item = child_arr[j];
                    item.active = false;
                }
            }
            j += 1;
        }

        //更新自己的排名
        this.showMyRank(arr,my_rank);
    },

    /**
     * 处理item
     */
    showMyRank:function(arr,node){
        let lab0 = node.getChildByName("lab0").getComponent(cc.Label);
        let lab1 = node.getChildByName("lab1").getComponent(cc.Label);
        let lab2 = node.getChildByName("lab2").getComponent(cc.Label);
        let head = node.getChildByName("head");
        for (let i = 0; i < arr.data.length; i++) {
            if(arr.data[i].id == cc.vv.userData.mid){
                lab0.string = "我的排名第" + arr.data[i].rank + "名";
                lab1.string = cc.vv.Global.getNameStr(arr.data[i].nickname);
                if(arr.score){
                    lab2.string = "积分:" + arr.score;
                }else{
                    lab2.string = "积分:" + arr.win;
                }
                cc.hallControl.loadHeadTexture(head, arr.data[i].headimgurl);
                cc.log(arr.data[i].rank,arr.data[i].nickname,arr.score,arr.win,arr.data[i].headimgurl);
                break;
            }
        }
    },

    /**
     * 处理item
     */
    showItem: function (node, obj) {
        let lv = node.getChildByName('lv');
        let level = node.getChildByName('level');
        lv.active = obj.rank <= 3 ? true : false;
        level.active = obj.rank > 3 ? true : false;
        if (lv.active) {
            lv.getComponent(cc.Sprite).spriteFrame = this.level_arr[obj.rank - 1];
        }
        if (level.active) {
            level.getComponent(cc.Label).string = obj.rank;
        }

        let head = node.getChildByName('lab0');
        cc.hallControl.loadHeadTexture(head, obj.headimgurl);

        let temp = ["nickname", "id", "score"];
        let str = ["", "ID:", "积分:"];
        for (let i = 0; i < 3; i++) {
            let lab = node.getChildByName('lab_' + i).getComponent(cc.Label);

            if(obj[temp[i]]){
                if(0 == i){
                    lab.string = cc.vv.Global.getNameStr(obj[temp[i]]);
                }else{
                    lab.string = str[i] + obj[temp[i]];
                }
            }else{
                lab.string = str[i] + obj.win;
            }
        }
    }
});