cc.Class({
    extends: cc.Component,

    properties: {
        item_0: cc.Prefab
    },

    onLoad () {
        this.huo_data = null;
        this.onOpenView();
    },

    onOpenView: function () {
        this.huo_arr = [0,0,0,0,0,0,0];
        this.getHuodong();
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        switch (type.toString()) {
            case 'back':
            {
                this.node.active = false;
                break;
            }
        }
    },

    getHuodong:function(){
        let postData = {};
        let url = cc.vv.http.URL;
        cc.vv.http.sendRequest(url + "huodong", postData, this.returnData.bind(this));
    },

    returnData:function(data){
        cc.log(data);
        if(1 == data.status){
            this.huo_data = data.data;
            for(let i = 0; i < 7; i++){
                let tog = cc.find("toggleGroup/toggle" + (i + 1),this.node);
                let lab = tog.getChildByName("Background").getComponent(cc.Label);
                let data_0 = this.huo_data[i];
                if(data_0){
                    lab.string = data_0.title;
                    if(!tog.active) tog.active = true;
                }else{
                    lab.string = "";
                    if(tog.active) tog.active = false;
                }
            }
            this.changeView();
        }
        if(data.msg) cc.loadingControl.showMsg(data.msg);
    },

    changeView:function(){
        for(let i = 0; i < this.huo_data.length; i++){
            let tog = cc.find("toggleGroup/toggle" + (i + 1),this.node).getComponent(cc.Toggle);
            let node = cc.find("node_arr/node_" + i,this.node);
            if(tog.isChecked){
                if(1 != this.huo_arr[i]){
                    let sprite_0 = node.children[0];
                    cc.hallControl.loadHeadTexture(sprite_0,this.huo_data[i].img);
                    this.huo_arr[i] = 1;
                }
                node.active = true;
            }else{
                node.active = false;
            }
        }
    }
});
