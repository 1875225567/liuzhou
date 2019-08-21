/**
 * 玩家数据
 */
cc.Class({
    extends: cc.Component,

    properties: {

    },

    ctor: function () {
        this.id = "";   //用户名
        this.version = "1.2.2";   //版本号

        this.nickname = "测试名字";   //名字
        this.avatarUrl = "";  //头像地址
        this.headimgurl = ""; //头像地址
        this.uid = "";        //uid
        this.gold = 0;        //金币数
        this.sex = 1;         //玩家性别
        this.mid = 0;         //收到后端的唯一id
        this.token = "";      //收到后端token
        this.is_agency = 0;   //是否是代理
        this.phone = 0;       //是否绑定手机号
        this.pid = 0;         //是否绑定代理
        this.user_level = 0;  //是否绑定代理

        this.face_status = 1;     //互动0关闭1开启
        this.change_bg = 0;       //背景切换0关闭1开启
        this.bgmVolume = 0.5;     //背景音量
        this.sfxVolume = 0.5;     //音效音量
        this.language_type = 0;   //0普通话1方言

        this.bg_index = 5;      //当前选中的背景图
        this.music_index = 0;   //当前选中的背景音乐
        this.head_skin = 0;     //当前选中的头像框

        this.bg_arr = [0];      //用于存放已购买的皮肤索引
        this.music_arr = [0];   //用于存放已购买的背景音乐索引
        this.head_arr = [0];    //用于存放已购买的头像框索引

        this.club_type = 0;     //俱乐部显示形式
        this.login_phone = "";  //玩家上次登录方式

        this.latitude = 0.0;    //纬度
        this.longitude = 0.0;   //经度
        this.address = "";      //详细地址
        this.mobile = "";       //手机型号
        this.device = "";       //机器码
        this.exitGame = false; //是否要退出游戏
        this.XLcode = "";       //是否要退出游戏

    },

    /**
     * 返回经纬度
     * @param latitude
     * @param longitude
     * @param address
     */
    getLocation: function (latitude, longitude, address) {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            console.log('返回定位', latitude, longitude, address);
            this.lat = latitude;
            this.lng = longitude;
            this.address = address;
        } else if (cc.sys.os == cc.sys.OS_IOS) {
            var a = jsb.reflection.callStaticMethod("GaoDeLocation", "getLatitude");
            this.lat = a;
            var b = jsb.reflection.callStaticMethod("GaoDeLocation", "getLongtiude");
            this.lng = b;
            var c = jsb.reflection.callStaticMethod("GaoDeLocation", "getAddress");
            this.address = c;

            jsb.reflection.callStaticMethod("GaoDeLocation", "cleanUpAction");
        }
    },

    /**
     * 判断当前背景索引是否已购买
     */
    checkHasBg: function (index) {
        let bool = false;
        for (let i = 0; i < this.bg_arr.length; i++) {
            if (this.bg_arr[i].toString() == index.toString()) {
                bool = true;
                break;
            }
        }
        return bool;
    },

    /**
     * 判断当前音乐索引是否已购买
     */
    checkHasMusic: function (index) {
        let bool = false;
        for (let i = 0; i < this.music_arr.length; i++) {
            if (this.music_arr[i].toString() == index.toString()) {
                bool = true;
                break;
            }
        }
        return bool;
    },

    /**
     * 判断当前头像框索引是否已购买
     */
    checkHasHead: function (index) {
        let bool = false;
        for (let i = 0; i < this.head_arr.length; i++) {
            if (this.head_arr[i].toString() == index.toString()) {
                bool = true;
                break;
            }
        }
        return bool;
    },

    /**
     * 获取的玩家数据
     */
    getUserInfo: function () {
        var userData = JSON.parse(cc.sys.localStorage.getItem('userData'));
        if (userData) {
            this.face_status = userData.hasOwnProperty('face_status') ? userData.face_status : 1;
            this.change_bg = userData.hasOwnProperty('change_bg') ? userData.change_bg : 1;
            this.bgmVolume = userData.hasOwnProperty('bgmVolume') ? parseFloat(userData.bgmVolume) : 0.5;
            this.sfxVolume = userData.hasOwnProperty('sfxVolume') ? parseFloat(userData.sfxVolume) : 0.5;
            this.language_type = userData.hasOwnProperty('language_type') ? userData.language_type : 0;
            this.bg_index = userData.hasOwnProperty('bg_index') ? userData.bg_index : 5;
            this.music_index = userData.hasOwnProperty('music_index') ? userData.music_index : 0;
            this.head_skin = userData.hasOwnProperty('head_skin') ? userData.head_skin : 0;
            this.club_type = userData.hasOwnProperty('club_type') ? userData.club_type : 0;
            this.login_phone = userData.hasOwnProperty('login_phone') ? userData.login_phone : "";
        }
    },

    /**
     * 保存获取的玩家数据
     */
    saveUserInfo: function () {
        var userData = {
            face_status: this.face_status,
            change_bg: this.change_bg,
            bgmVolume: this.bgmVolume,
            sfxVolume: this.sfxVolume,
            language_type: this.language_type,
            bg_index: this.bg_index,
            music_index: this.music_index,
            head_skin: this.head_skin,
            club_type: this.club_type,
            login_phone: this.login_phone
        };
        cc.sys.localStorage.setItem('userData', JSON.stringify(userData));
    }
});