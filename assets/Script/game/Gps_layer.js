/**
 * gps层
 */
cc.Class({
    extends: cc.Component,

    properties: {
        line_node: cc.Node,
        icon_arr: [cc.Node],
        atlas: cc.SpriteAtlas
    },

    ctor: function () {
        this.isShowing = false;
        this.line_pos_data = {
            '4': [-5, 0],
            //'3': [-5, -44],
            '3': [118, 0],
            '2': [0, 0]
        }; //4,3,2
        this.data = null;
    },

    onLoad: function () {

    },

    onDestroy: function () {
        cc.loader.setAutoReleaseRecursively('Prefab/game/gps_layer', true);
    },

    onOpenView: function (data) {
        //this.data = data;
        //if (this.data == null) {
        //    this.data = {
        //        ren: 4
        //    }
        //}
        this.isShowing = true;
        var bg = this.node.getChildByName('bg');
        bg.scale = 0;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 1).easing(cc.easeBackOut()),
            cc.callFunc(function () {
                this.isShowing = false;
            }.bind(this))
        ));
        this.updateView();
    },

    updateView: function () {
        var ren = cc.gameControl.game_ren; //人数
        if(3 == ren){
            let self = this;
            cc.loader.loadRes("game/gps_line3", cc.SpriteFrame, function (err, spriteFrame) {
                self.line_node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
        }else{
            this.line_node.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame('gps-line' + ren);
        }
        var pos_arr = this.line_pos_data[ren.toString()];
        this.line_node.x = pos_arr[0];
        this.line_node.y = pos_arr[1];
        var arr = [];
        if (ren == 3) {
            //arr = [2];
            arr = [3];
        } else if (ren == 2) {
            arr = [1, 3];
        }
        this.hidIcon(arr);
    },

    hidIcon: function (arr) {
        cc.log(cc.gameControl.roomInfo.zuobiao,cc.gameControl.player_id_arr,cc.gameControl.userInfo);
        let j = 0;
        for (let i = 0; i < 4; i++) {
            let icon = this.icon_arr[i];
            let index = arr.indexOf(i);
            if (index != -1) {
                icon.active = false;
            } else {
                icon.active = true;
                icon.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gray");
                let disArr = cc.gameControl.roomInfo.zuobiao;
                let id = cc.gameControl.player_id_arr[j];
                let address = cc.gameControl.userInfo[id];
                cc.log(disArr[id],address);
                if(disArr[id] && address){
                    if(disArr[id].jing && address.address && "0.0" !== disArr[id].jing && "" !== address.address){
                        icon.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-green");
                    }
                }
                j++
            }
        }

        this.showDistance();
    },

    showDistance:function(){
        var ren = cc.gameControl.game_ren; //人数
        let disArr = cc.gameControl.roomInfo.zuobiao;
        //let id_arr = [];
        //for(let i in cc.gameControl.player_id_arr){
        //    cc.log(i,cc.gameControl.player_id_arr[i]);
        //    //id_arr[i] = cc.gameControl.player_id_arr[i]
        //}
        let id_1 = cc.gameControl.player_id_arr[0];
        let id_2 = cc.gameControl.player_id_arr[1];
        let id_3 = cc.gameControl.player_id_arr[2];
        let id_4 = cc.gameControl.player_id_arr[3];
        let dis_1 = cc.Test.calculate(disArr[id_1],disArr[id_2]);
        let dis_2 = cc.Test.calculate(disArr[id_1],disArr[id_3]);
        let dis_3 = cc.Test.calculate(disArr[id_1],disArr[id_4]);
        let dis_4 = cc.Test.calculate(disArr[id_2],disArr[id_3]);
        let dis_5 = cc.Test.calculate(disArr[id_2],disArr[id_4]);
        let dis_6 = cc.Test.calculate(disArr[id_3],disArr[id_4]);
        let dis_label_1 = cc.find("bg/duraction0",this.node);
        let dis_label_2 = cc.find("bg/duraction1",this.node);
        let dis_label_3 = cc.find("bg/duraction2",this.node);
        let dis_label_4 = cc.find("bg/duraction3",this.node);
        let dis_label_5 = cc.find("bg/duraction4",this.node);
        let dis_label_6 = cc.find("bg/duraction5",this.node);
        if (ren == 3) {
            cc.log("三人房间", disArr, id_1, id_2, id_3);
            cc.log("三人距离", dis_1, dis_2, dis_4);
            if("无定位数据" !== dis_1){
                dis_label_1.active = true;
                dis_label_1.getComponent(cc.Label).string = dis_1.distance;
                if(dis_1.boolen){
                    this.icon_arr[0].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                    this.icon_arr[1].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                }
            }

            if("无定位数据" !== dis_2){
                dis_label_5.active = true;
                dis_label_5.getComponent(cc.Label).string = dis_2.distance;
                if(dis_2.boolen){
                    this.icon_arr[0].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                    this.icon_arr[2].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                }
            }

            if("无定位数据" !== dis_4){
                dis_label_2.active = true;
                dis_label_2.getComponent(cc.Label).string = dis_4.distance;
                if(dis_4.boolen){
                    this.icon_arr[2].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                    this.icon_arr[1].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                }
            }
        } else if (ren == 2) {
            cc.log("二人距离",dis_1);
            if("无定位数据" !== dis_1){
                dis_label_5.active = true;
                dis_label_5.getComponent(cc.Label).string = dis_1.distance;
                if(dis_1.boolen){
                    this.icon_arr[0].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                    this.icon_arr[2].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                }
            }
        } else {
            cc.log("四人距离",dis_1,dis_2,dis_3,dis_4,dis_5,dis_6);
            if("无定位数据" !== dis_1){
                dis_label_1.active = true;
                dis_label_1.getComponent(cc.Label).string = dis_1.distance;
                if(dis_1.boolen){
                    this.icon_arr[0].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                    this.icon_arr[1].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                }
            }

            if("无定位数据" !== dis_2){
                dis_label_5.active = true;
                dis_label_5.getComponent(cc.Label).string = dis_2.distance;
                if(dis_2.boolen){
                    this.icon_arr[0].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                    this.icon_arr[2].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                }
            }

            if("无定位数据" !== dis_3){
                dis_label_4.active = true;
                dis_label_4.getComponent(cc.Label).string = dis_3.distance;
                if(dis_3.boolen){
                    this.icon_arr[0].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                    this.icon_arr[3].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                }
            }

            if("无定位数据" !== dis_4){
                dis_label_2.active = true;
                dis_label_2.getComponent(cc.Label).string = dis_4.distance;
                if(dis_4.boolen){
                    this.icon_arr[2].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                    this.icon_arr[1].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                }
            }

            if("无定位数据" !== dis_5){
                dis_label_6.active = true;
                dis_label_6.getComponent(cc.Label).string = dis_5.distance;
                if(dis_5.boolen){
                    this.icon_arr[3].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                    this.icon_arr[1].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                }
            }

            if("无定位数据" !== dis_6){
                dis_label_3.active = true;
                dis_label_3.getComponent(cc.Label).string = dis_6.distance;
                if(dis_6.boolen){
                    this.icon_arr[2].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                    this.icon_arr[3].getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame("gps-gps_red");
                }
            }
        }
    },

    onClickView: function () {
        this.isShowing = true;
        var bg = this.node.getChildByName('bg');
        bg.scale = 1;
        bg.runAction(cc.sequence(
            cc.scaleTo(0.3, 0).easing(cc.easeBackIn()),
            cc.callFunc(function () {
                this.isShowing = false;
                this.node.active = false;
            }.bind(this))
        ));
    },

    onClickBtn: function (event, type) {
        cc.vv.audioMgr.playSFX('ui_open', 'mp3');
        if (this.isShowing) return;
        switch (type.toString()) {
            case 'back':
                {
                    this.onClickView();
                    break;
                }
        }
    }
});