var GpsProcess = require("GpsProcess");

cc.Test = new Object();
/**
 * 返回机器码
 */
cc.Test.backMachine = function () {
    console.log('LFC:返回机器码');
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        cc.vv.userData.machine = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getIMEI", "()Ljava/lang/String;");
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        cc.vv.userData.machine = jsb.reflection.callStaticMethod("AppController", "getMachineId");
    }
};

/**
 * 返回图片转base64 (选择头像转base64返回)
 */
cc.Test.backBase64 = function () {
    console.log('LFC:返回base64');
    var base64 = '';
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        base64 = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getImgBase64", "()Ljava/lang/String;");
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        base64 = jsb.reflection.callStaticMethod("AppController", "getImgBase64");
    }
    if (base64.length) {
        cc.vv.Global.base64_js.callBack(base64);
    }
};

/**
 * 返回base64转图片地址 （后端传递的base64转图片保存本地，用于获取验证码图片）
 */
cc.Test.backImgPath = function () {
    console.log('LFC:返回base64转图片地址');
    var path = '';
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        path = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getImgPath", "()Ljava/lang/String;");
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        path = jsb.reflection.callStaticMethod("AppController", "getImgPath");
    }
    if (path.length) {
        cc.vv.Global.imgpath_js.callBack(path);
    }
};

/**
 * 返回base54字符串和图片地址 (选择照片上传，返回base64和本地照片地址)
 */
cc.Test.backUpload = function () {
    console.log('LFC:返回base54字符串和图片地址');
    var base64 = '';
    var path = '';
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        base64 = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getImgBase64", "()Ljava/lang/String;");
        path = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getImgPath", "()Ljava/lang/String;");
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        base64 = jsb.reflection.callStaticMethod("AppController", "getImgBase64");
        path = jsb.reflection.callStaticMethod("AppController", "getImgPath");
    }
    if (base64.length && path.length) {
        cc.vv.Global.upload_js.callBack(base64, path);
    }
};

/**
 * 返回通知扫码结果 (扫码转出给默认，返回的是要转给人的id)
 */
cc.Test.backSaoMa = function () {
    console.log('LFC:返回通知扫码结果');
    var p_mid = '';
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        p_mid = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getSaoMaMid", "()Ljava/lang/String;");
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        p_mid = jsb.reflection.callStaticMethod("AppController", "getSaoMaMid");
    }
    if (p_mid.length && cc.vv.Global.hallControl) {
        cc.vv.Global.hallControl.onOpenView('hall_zhuanru_layer', {
            p_mid: p_mid
        });
    }
};

/**
 * 返回通知定位结果
 */
cc.Test.backLocation = function () {
    console.log('LFC:返回通知定位结果');
    var lat = "", lng = "", add = "", cit = "", man = "", pro = '', bra = '', mod = "";
    if (cc.sys.os == cc.sys.OS_ANDROID) {
        //lat = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getLatitude", "()Ljava/lang/String;");
        //lng = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getLongitude", "()Ljava/lang/String;");
        //add = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getAddress", "()Ljava/lang/String;");
        //cit = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getCity", "()Ljava/lang/String;");
        //man = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeviceManufacturer", "()Ljava/lang/String;");
        //pro = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeviceProduct", "()Ljava/lang/String;");
        bra = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeviceBrand", "()Ljava/lang/String;");
        mod = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getDeviceModel", "()Ljava/lang/String;");
        //cc.vv.userData.lat = lat;
        //cc.vv.userData.lng = lng;
        //cc.vv.userData.address = add;
        //cc.vv.userData.city = cit;
        cc.vv.userData.mobile = bra + mod;
    } else if (cc.sys.os == cc.sys.OS_IOS) {
        //lat = jsb.reflection.callStaticMethod("AppController", "getLatitude");
        //lng = jsb.reflection.callStaticMethod("AppController", "getLongitude");
        //add = jsb.reflection.callStaticMethod("AppController", "getAddress");
        //cit = jsb.reflection.callStaticMethod("AppController", "getCity");
        //cc.vv.userData.lat = lat;
        //cc.vv.userData.lng = lng;
        //cc.vv.userData.address = add;
        //cc.vv.userData.city = cit;
        //cc.vv.userData.mobile = bra + mod;
    }

    //if(man){
    //    cc.loadingControl.showMsg("厂商名" + man + "产品名" + pro + "手机品牌" + bra + "手机型号" + mod)
    //}

    // cc.log(cc.vv.userData.lat, cc.vv.userData.lng, cc.vv.userData.address);
};

/**
 * JS版经纬度测距离
 */
cc.Test.calculate = function(locFirst, locSecond){
    cc.log(locFirst, locSecond);
    if(locFirst == null || locFirst == {} || locFirst == undefined){
        return "无定位数据"
    }
    if(locSecond == null || locSecond == {} || locSecond == undefined){
        return "无定位数据"
    }
    // var tempArr = locFirst.split(",");
    // var latA = tempArr[1];
    // var lonA = tempArr[0];
    var latA = parseInt(locFirst.wei);
    var lonA = parseInt(locFirst.jing);

    // tempArr = locSecond.split(",");
    // var latB = tempArr[1];
    // var lonB = tempArr[0];
    var latB = parseInt(locSecond.wei);
    var lonB = parseInt(locSecond.jing);
    if(latA && lonA && latB && lonB){
        var distance = GpsProcess.distance(latA, lonA, latB, lonB)
    }else{
        return "无定位数据"
    }

    let numGongLi = "";
    let dis = "公里";
    let data = {};
    let bol = false;
    if(distance / 1000 < 1) {
        numGongLi = (distance).toFixed(1);
        dis = "米";
        if(10 > parseInt(numGongLi)){
            bol = true;
        }
    }else{
        numGongLi = (distance / 1000).toFixed(1);
    }
    if(numGongLi == "0.0") numGongLi = "0.1";
    data.distance = numGongLi.toString() + dis;
    data.boolen = bol;
    //this._distance = numGongLi;
    return data;
};