/**
 * 麻将控制类
 * 挂在预制上面
 */
cc.Class({
    extends: cc.Component,

    ctor:function () {
        this.begin_y = -310;//开始位置
        this.max_y = -242;//结束位置
        this.out_y = -182;//可以移动x位置
        this.chupai_y = -183;//出牌位置
        this.max_y_height = -150; //牌面最大上滑高度
        this.isChecking = false;//检查双击
        this.begin_zIndex = 0;
        this.isCanTouch = true;
    },

    properties: {
        icon:cc.Sprite
    },

    onLoad: function () {
        this.begin_zIndex = this.node.zIndex;
        this.node.on("touchmove", this.onTouchMove.bind(this));
        this.node.on("touchend", this.onTouchEnd.bind(this));
        this.node.on("touchcancel", this.onTouchCancel.bind(this));
    },

    /**
     * 设置上层mask是否显示，Node是否开启交互
     */
    setEnable:function (CanTouch) {
        console.log("执行了设置牌面变色");
        this.isCanTouch = CanTouch;
        if(CanTouch){
            this.node.color = cc.color(255,255,255)
        }else{
            this.node.color = cc.color(120,120,120)
        }
    },

    /**
     * 在牌区域内移动
     */
    onTouchMove:function(touch){
        if(!this.isCanTouch) return;
        if(this.checkCanTouch() == false) return;
        cc.gameControl.onTouchMaj(this.node, true);
        //不是当前选中的牌就不要改变坐标了
        if(this.node != cc.gameControl.current_maj && cc.gameControl.current_maj != null) return;
        this.node.zIndex = 100;
        let pos_Y = touch.getLocationY() - 360;
        this.node.y = pos_Y;
        let pos_X = touch.getLocationX() - 640;
        this.node.x = pos_X;
        if(this.node.y < this.begin_y){
            this.node.y = this.begin_y;
        }else{
            if(this.node.y > this.max_y){
                if(this.node.y >= this.out_y){
                    let posX = touch.getDeltaX();
                    this.node.x += posX;
                }
            }
            let posY = touch.getDeltaY();
            if(this.node.y < this.max_y_height){
                this.node.y += posY;
            }
        }
        touch.stopPropagation();
    },

    /**
     * 在牌区域内离开
     */
    onTouchEnd:function(event){
        if(!this.isCanTouch) return;
        cc.log("onTouchEnd--------------------------------------------------------------------------------");
        event.stopPropagation();//可见时，阻挡消息传递
        if(this.checkCanTouch() == false) return;
        if(this.node.y >= this.chupai_y){
            cc.log("达到你出牌高度");
            cc.gameControl.onCheckChuPai(this.node);
        }else{
            cc.log("未达到高度");
            cc.gameControl.onTouchMaj(this.node, true);
            cc.log(this.isChecking);
            cc.log("this.isChecking==============="+this.isChecking);
            if(this.isChecking == false){
                this.isChecking = true;
                this.scheduleOnce(this.checkClick, 0.5);
            }else{
                cc.log("chupai出牌了");
                cc.gameControl.onCheckChuPai(this.node);
                this.isChecking = false;
            }
        }
        this.node.zIndex = this.begin_zIndex;
    },

    /**
     * 异常拖动，在节点范围外触摸结束
     */
    onTouchCancel:function (touch) {
        if(!this.isCanTouch) return;
        if(this.checkCanTouch() == false) return;
        if(this.node.y >= this.chupai_y){
            cc.gameControl.onCheckChuPai(this.node);
        }else {
            cc.gameControl.onTouchMaj(this.node, true);
        }
        this.node.zIndex = this.begin_zIndex;
        touch.stopPropagation();
    },

    checkClick:function () {
        //this.isChecking = false;
    },

    checkCanTouch:function () {
        if(cc.gameControl && cc.gameControl.isCanTouch == false){
            cc.log("cc.gameControl.isCanTouch == false");
            return false;
        }
        if(this.node.pai == 0 || this.node.opacity == 0){
            return false;
        }
        return true;
    },

    onDestroy:function(){
        this.node.off("touchmove", this.onTouchMove);
        this.node.off("touchend", this.onTouchEnd);
        this.node.off("touchcancel", this.onTouchCancel);
    }
});
