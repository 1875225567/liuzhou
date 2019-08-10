/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package org.cocos2dx.javascript;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import org.cocos2dx.javascript.SDKWrapper;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import android.os.Environment;
import android.provider.MediaStore;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v4.content.FileProvider;
import android.util.Log;
import android.view.WindowManager;
import android.widget.Toast;

import com.a00123.aiyuesdk.AiyueSDK;
import com.a00123.aiyuesdk.receiver.ShareResultImpl;
import com.amap.api.location.AMapLocation;
import com.amap.api.location.AMapLocationClient;
import com.amap.api.location.AMapLocationClientOption;
import com.amap.api.location.AMapLocationListener;
import com.lzmj.app.keystore.R;

import android.content.ComponentName;
import android.content.ActivityNotFoundException;

import java.util.HashMap;
import java.util.List;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;

import cn.jiguang.share.android.api.AuthListener;
import cn.jiguang.share.android.api.JShareInterface;
import cn.jiguang.share.android.api.PlatActionListener;
import cn.jiguang.share.android.api.Platform;
import cn.jiguang.share.android.api.ShareParams;
import cn.jiguang.share.android.model.AccessTokenInfo;
import cn.jiguang.share.android.model.BaseResponseInfo;
import cn.jiguang.share.android.model.UserInfo;
import cn.jiguang.share.wechat.Wechat;
import cn.jiguang.share.wechat.WechatMoments;
import pub.devrel.easypermissions.EasyPermissions;

public class AppActivity extends Cocos2dxActivity implements EasyPermissions.PermissionCallbacks{
    //相册请求码
    private static final int ALBUM_REQUEST_CODE = 1;
    //相机请求码
    private static final int CAMERA_REQUEST_CODE = 2;
    //剪裁请求码
    private static final int CROP_REQUEST_CODE = 3;
    //调用照相机返回图片文件
    public Uri imageUri = null;
    public Uri mCutUri = null;
    private File tempFile;
    private static final int BAIDU_READ_PHONE_STATE = 100;
    public static AppActivity app;
    private static Context context;
    private double latitude = 0;//纬度
    private double longitude = 0;//经度
    private String address = "";//地址
    private String city = "";//城市
    private String bra = "";//手机品牌
    private String mod = "";//手机型号
    public int battery_level = 0;//电池电量值
    private String img_src;//要上传的图片地址

    //剪贴板
    private static ClipboardManager myClipboard;

    //声明AMapLocationClient类对象
    public AMapLocationClient mLocationClient = null;

    private static String base64_str = "";

    public static final int NONE = 0;
    public static final int PHOTOZOOM = 2;      // 缩放
    public static final String IMAGE_UNSPECIFIED = "image/*";

    //声明AMapLocationClientOption对象
    public AMapLocationClientOption mLocationOption = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            // Android launched another instance of the root activity into an existing task
            //  so just quietly finish and go away, dropping the user back into the activity
            //  at the top of the stack (ie: the last state of this task)
            // Don't need to finish it again since it's finished in super.onCreate .
            return;
        }
        // DO OTHER INITIALIZATION BELOW
        app = this;
        context = getApplicationContext();
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        SDKWrapper.getInstance().init(this);
        //WeChatShare.getInstance().init(this);

        // setContentView(R.layout.activity_main);

        //初始化定位
        mLocationClient = new AMapLocationClient(getApplicationContext());
        //设置定位回调监听
        mLocationClient.setLocationListener(mLocationListener);
        //初始化AMapLocationClientOption对象
        mLocationOption = new AMapLocationClientOption();
        mLocationOption.setLocationPurpose(AMapLocationClientOption.AMapLocationPurpose.SignIn);
        //设置定位模式为AMapLocationMode.Battery_Saving，低功耗模式。AMapLocationMode
        mLocationOption.setLocationMode(AMapLocationClientOption.AMapLocationMode.Hight_Accuracy);
        //获取一次定位结果：
        mLocationOption.setOnceLocation(true);
        //设置是否允许模拟位置,默认为false，不允许模拟位置
        mLocationOption.setMockEnable(false);
        //获取最近3s内精度最高的一次定位结果：
        mLocationOption.setOnceLocationLatest(true);
        //设置是否返回地址信息（默认返回地址信息）
        mLocationOption.setNeedAddress(true);
        mLocationClient.setLocationOption(mLocationOption);
        //启动定位
        mLocationClient.startLocation();

        //电池监听 IntentFilter
        this.registerReceiver(this.mBatteryReceiver, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));

        //获取剪贴板对象
        myClipboard = (ClipboardManager)getSystemService(CLIPBOARD_SERVICE);
//        Log.d("获取到的sha1码=",SHA1(this));

        this.requestAudioPermission();
        // this.sendPermission();
    }

    private static String[] mPermissions = new String[]{
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.BATTERY_STATS,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.CAMERA
    };

    private void requestAudioPermission(){
        //请求权限
        if (EasyPermissions.hasPermissions(this, mPermissions)){
        }else{
            EasyPermissions.requestPermissions(this,"请给予定位与录音权限",998,mPermissions);
        }
    }

    //声明定位回调监听器AMapLocationListener AMapLocation
    public AMapLocationListener mLocationListener = new AMapLocationListener(){
        @Override
        public void onLocationChanged(AMapLocation amapLocation) {
            Log.d("TMJH","执行了onLocationChanged中的定位代码");
            if (amapLocation != null) {
                if (amapLocation.getErrorCode() == 0) {
                    //可在其中解析amapLocation获取相应内容。
                    latitude = amapLocation.getLatitude();//获取纬度
                    longitude = amapLocation.getLongitude();//获取经度
                    address = amapLocation.getAddress()+" ";//获取地址
                    city = amapLocation.getAddress()+" ";//获取城市
                    String str = address.replaceAll("\\(","<");
                    String str1 = str.replaceAll("\\)",">");
                    address = str1;
                    String strc = city.replaceAll("\\(","<");
                    String str1c = strc.replaceAll("\\)",">");
                    city = str1c;
                    bra = android.os.Build.BRAND;
                    mod = android.os.Build.MODEL;
                    Log.i("TMJH", "高德获取经纬度 la : " + latitude + " lo : " + longitude + " address: "+ address + " city: "+ city + " bra: "+ bra + " mod: "+ mod);
                    app.runOnGLThread(new Runnable() {
                        @Override
                        public void run() {
//                            String paySuccessMsg = String.format("cc.vv.userData.getLocation(%s,%s,%s)",app.latitude,app.longitude,app.address);
//                            Log.i("paySuccessMsg",paySuccessMsg);
//                            Cocos2dxJavascriptJavaBridge.evalString(paySuccessMsg);
                            String paySuccessMsg = String.format("cc.NativeMsg.getLocation(\"" + app.latitude + "\",\""+app.longitude+"\",\""+ app.address + "\",\""+ app.bra + "\",\""+ app.mod + "\")");
                            Cocos2dxJavascriptJavaBridge.evalString(paySuccessMsg);
                        }
                    });
                }else {
                    //定位失败时，可通过ErrCode（错误码）信息来确定失败的原因，errInfo是错误信息，详见错误码表。
                    Log.i("AmapError","高德 location Error, ErrCode:" + amapLocation.getErrorCode() + ", errInfo:" + amapLocation.getErrorInfo());
                }
            }else{
                Log.i("TMJH",amapLocation.toString());
            }
        }
    };

    // 要申请的权限
    private static String[] permissions = new String[]{
            // Manifest.permission.RECORD_AUDIO,
            // Manifest.permission.BATTERY_STATS,
            // Manifest.permission.ACCESS_COARSE_LOCATION,
            // Manifest.permission.ACCESS_FINE_LOCATION,
            // Manifest.permission.WRITE_EXTERNAL_STORAGE,
            // Manifest.permission.CAMERA
    };

    public static String SHA1(Context context) {
        try {
            PackageInfo info = context.getPackageManager().getPackageInfo(
                    context.getPackageName(), PackageManager.GET_SIGNATURES);
            byte[] cert = info.signatures[0].toByteArray();
            MessageDigest md = MessageDigest.getInstance("SHA1");
            byte[] publicKey = md.digest(cert);
            StringBuffer hexString = new StringBuffer();
            for (int i = 0; i < publicKey.length; i++) {
                String appendString = Integer.toHexString(0xFF & publicKey[i])
                        .toUpperCase(Locale.US);//Locale
                if (appendString.length() == 1)
                    hexString.append("0");
                hexString.append(appendString);
                hexString.append(":");
            }
            String result = hexString.toString();
            return result.substring(0, result.length()-1);
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 复制东西至剪贴板
     */
    public static void copy(final String str){
        app.runOnUiThread(new Runnable() {
            @Override
            public void run() {
//                // 从API11开始android推荐使用android.content.ClipboardManager
//                // 为了兼容低版本我们这里使用旧版的android.text.ClipboardManager，虽然提示deprecated，但不影响使用。
//                ClipboardManager cm = (ClipboardManager) app.getSystemService(app.CLIPBOARD_SERVICE);
//                Log.d("copy","运行到了复制代码-------------------------------------------------------------------str="+str);
//                // 将文本内容放到系统剪贴板里。
//                cm.setText(str.trim());
                //获取剪贴板管理器：
                ClipboardManager cm = (ClipboardManager) app.getSystemService(Context.CLIPBOARD_SERVICE);
                // 创建普通字符型ClipData
                ClipData mClipData = ClipData.newPlainText("Label", str);
                // 将ClipData内容放到系统剪贴板里。
                cm.setPrimaryClip(mClipData);
            }
        });
    }

    /**
     * 获取剪贴板内容
     */
    public static String getCopyStr(){
        String text = "";
        ClipData abc = myClipboard.getPrimaryClip();
        if(abc != null){
            ClipData.Item item = abc.getItemAt(0);
            if(item != null){
                text = item.getText().toString();
            }
        }
        return text;
    }

    /**
     * 当资源加载好了之后要删除之前创建的imageView
     */
    // public static void removeLaunchImage() {
    // app.sendPermission();
    // };

    /**
     * 获取电池电量
     * @return
     */
    public static int getBatteryLevel(){
        return app.battery_level;
    };

    /**
     * 调用浏览器
     * @param url
     */
    public static void browser(String url){
        Intent intent = new Intent();
        intent.setAction(Intent.ACTION_VIEW);
        Uri content_url = Uri.parse(url);
        intent.setData(content_url);
        app.startActivity(intent);
    }

    /**
     * 跳转到微信
     */
    private static void getWechatApi(){
        try {
            Intent intent = new Intent(Intent.ACTION_MAIN);
            ComponentName cmp = new ComponentName("com.tencent.mm","com.tencent.mm.ui.LauncherUI");
            intent.addCategory(Intent.CATEGORY_LAUNCHER);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.setComponent(cmp);
            app.startActivity(intent);
        } catch (ActivityNotFoundException e) {
            Toast.makeText(app,"检查到您手机没有安装微信", Toast.LENGTH_LONG);
        }
    }

    /**
     * 开启权限
     */
    private void sendPermission() {
        //检查权限
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED
                    || ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                    || ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED
                    || ContextCompat.checkSelfPermission(context, Manifest.permission.BATTERY_STATS) != PackageManager.PERMISSION_GRANTED
                    || ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED
                    || ContextCompat.checkSelfPermission(context, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                //请求权限ActivityCompat
                ActivityCompat.requestPermissions(app,permissions, BAIDU_READ_PHONE_STATE);
            }else{
                if(null != mLocationClient){
                    //设置场景模式后最好调用一次stop，再调用start以保证场景模式生效
                    mLocationClient.stopLocation();
                    mLocationClient.startLocation();
                }
                LocationManager locManager = (LocationManager)getSystemService(Context.LOCATION_SERVICE);
                Location l;
                if(!locManager.isProviderEnabled(LocationManager.GPS_PROVIDER) || !locManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)){

                }else if(locManager.isProviderEnabled(LocationManager.GPS_PROVIDER)){
                    l = LocationUtils.getGPSLocation(context);
                }else if(locManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)){
                    l = LocationUtils.getNetWorkLocation(context);
                }
            }
        }else{
            if(null != mLocationClient){
                //设置场景模式后最好调用一次stop，再调用start以保证场景模式生效
                mLocationClient.stopLocation();
                mLocationClient.startLocation();
            }

            LocationManager locManager = (LocationManager)getSystemService(Context.LOCATION_SERVICE);
            Location l;
            if(!locManager.isProviderEnabled(LocationManager.GPS_PROVIDER) || !locManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)){

            }else if(locManager.isProviderEnabled(LocationManager.GPS_PROVIDER)){
                l = LocationUtils.getGPSLocation(context);
            }else if(locManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)){
                l = LocationUtils.getNetWorkLocation(context);
            }
        }
    }

    /**
     * 将文件转成base64 字符串
     * @return  *
     * @throws Exception
     */
    public static void encodeBase64File(String path) throws Exception {
        InputStream in = null;
        byte[] data = null;
        // 读取图片字节数组
        try {
            in = new FileInputStream(path);
            data = new byte[in.available()];
            in.read(data);
            in.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 对字节数组Base64编码
        //BASE64Encoder encoder = new BASE64Encoder();
        // 返回Base64编码过的字节数组字符串
//        return encoder.encode(data);

        //base64_str = encoder.encode(data);
//        return new String(Base64.encodeBase64(data));

        app.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                String paySuccessMsg = String.format("cc.vv.userData.getImgBase64()");
                Cocos2dxJavascriptJavaBridge.evalString(paySuccessMsg);
            }
        });
    }

    /**
     * 权限的结果回调函数
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == BAIDU_READ_PHONE_STATE) {
            if(null != mLocationClient){
                //设置场景模式后最好调用一次stop，再调用start以保证场景模式生效
                mLocationClient.stopLocation();
                mLocationClient.startLocation();
            }

            LocationManager locManager = (LocationManager)getSystemService(Context.LOCATION_SERVICE);
            Location l;
            if(!locManager.isProviderEnabled(LocationManager.GPS_PROVIDER) || !locManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)){
            }else if(locManager.isProviderEnabled(LocationManager.GPS_PROVIDER)){
                l = LocationUtils.getGPSLocation(context);
            }else if(locManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)){
                l = LocationUtils.getNetWorkLocation(context);
            }
        }
    }
    
    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);
        SDKWrapper.getInstance().setGLSurfaceView(glSurfaceView, this);

        return glSurfaceView;
    }

    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.getInstance().onResume();

    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.getInstance().onPause();

    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        SDKWrapper.getInstance().onDestroy();

        mLocationClient.stopLocation();//停止定位后，本地定位服务并不会被销毁
        mLocationClient.onDestroy();//销毁定位客户端，同时销毁本地定位服务。
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SDKWrapper.getInstance().onActivityResult(requestCode, resultCode, data);

        if (resultCode == NONE){
            return;
        }
        switch (requestCode) {
            case CAMERA_REQUEST_CODE:   //调用相机后返回
                Log.i("田忌赛马","唤起相机返回");
                if (resultCode == RESULT_OK) {
                    //用相机返回的照片去调用剪裁也需要对Uri进行处理
//                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
//                        Uri contentUri = FileProvider.getUriForFile(AppActivity.this, "com.tmjh.yjyl.keystore", tempFile);
//                        cropPhoto(contentUri);
//                    } else {
//                        cropPhoto(Uri.fromFile(tempFile));
//                    }

                    //启动裁剪
                    String path = app.getExternalCacheDir().getPath();
                    String name = "output.png";
                    startActivityForResult(CutForCamera(path,name),CROP_REQUEST_CODE);
                }
                break;
            case ALBUM_REQUEST_CODE:    //调用相册后返回
                Log.i("田忌赛马","唤起相册返回");
//                if (resultCode == RESULT_OK) {
//                    Uri uri = data.getData();
//                    String path = getRealFilePath(app, uri);
//                    try {
//                        encodeBase64File(path);
//                    } catch (Exception e) {
//                        e.printStackTrace();
//                    }
//                    //cropPhoto(uri);
//                }
                startActivityForResult(CutForPhoto(data.getData()),CROP_REQUEST_CODE);
                break;
            case CROP_REQUEST_CODE:     //调用剪裁后返回
                Log.i("田忌赛马","相册裁剪返回");
//                Bundle bundle = data.getExtras();
//                if (bundle != null) {
//                    //在这里获得了剪裁后的Bitmap对象，可以用于上传
//                    Bitmap image = bundle.getParcelable("data");
//                    //设置到ImageView上
//                    // mHeader_iv.setImageBitmap(image);
//                    //也可以进行一些保存、压缩等操作后上传
//                    img_src = saveImage("crop", image);
//                    String path = img_src;
//                    //将图片进行base64加密
//                    try {
//                        encodeBase64File(path);
//                    } catch (Exception e) {
//                        e.printStackTrace();
//                    }
//                }

                String path = getRealFilePath(context, mCutUri);
                Log.i("LFC", path);
                if(mCutUri != null){
                    try {
                        encodeBase64File(path);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                break;
        }
    }

    /**
     * 拍照之后，启动裁剪
     * @param camerapath 路径
     * @param imgname img 的名字
     * @return
     */
    @NonNull
    private Intent CutForCamera(String camerapath,String imgname) {
        try {
            //设置裁剪之后的图片路径文件
            File cutfile = new File(Environment.getExternalStorageDirectory().getPath(),
                    "cutcamera.png"); //随便命名一个
            if (cutfile.exists()){ //如果已经存在，则先删除,这里应该是上传到服务器，然后再删除本地的，没服务器，只能这样了
                cutfile.delete();
            }
            cutfile.createNewFile();
            //初始化 uri
            Uri imageUri = null; //返回来的 uri
            Uri outputUri = null; //真实的 uri
            Intent intent = new Intent("com.android.camera.action.CROP");
            //拍照留下的图片
            File camerafile = new File(camerapath,imgname);
            if (Build.VERSION.SDK_INT >= 24) {
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                imageUri = FileProvider.getUriForFile(app,
                        "com.tmjh.yjyl.keystore.fileprovider",
                        camerafile);
            } else {
                imageUri = Uri.fromFile(camerafile);
            }
            outputUri = Uri.fromFile(cutfile);
            //把这个 uri 提供出去，就可以解析成 bitmap了
            mCutUri = outputUri;
            // crop为true是设置在开启的intent中设置显示的view可以剪裁
            intent.putExtra("crop",true);
            // aspectX,aspectY 是宽高的比例，这里设置正方形
            intent.putExtra("aspectX",1);
            intent.putExtra("aspectY",1);
            //设置要裁剪的宽高
            intent.putExtra("outputX", 200);
            intent.putExtra("outputY",200);
            intent.putExtra("scale",true);
            //如果图片过大，会导致oom，这里设置为false
            intent.putExtra("return-data",false);
            if (imageUri != null) {
                intent.setDataAndType(imageUri, "image/*");
            }
            if (outputUri != null) {
                intent.putExtra(MediaStore.EXTRA_OUTPUT, outputUri);
            }
            intent.putExtra("noFaceDetection", true);
            //压缩图片
            intent.putExtra("outputFormat", Bitmap.CompressFormat.JPEG.toString());
            return intent;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 相册图片裁剪
     * @param uri
     * @return
     */
    @NonNull
    private Intent CutForPhoto(Uri uri) {
        try {
            //直接裁剪
            Intent intent = new Intent("com.android.camera.action.CROP");
            //设置裁剪之后的图片路径文件
            File cutfile = new File(Environment.getExternalStorageDirectory().getPath(),
                    "cutcamera.png"); //随便命名一个
            if (cutfile.exists()){ //如果已经存在，则先删除,这里应该是上传到服务器，然后再删除本地的，没服务器，只能这样了
                cutfile.delete();
            }
            cutfile.createNewFile();
            //初始化 uri
            Uri imageUri = uri; //返回来的 uri
            Uri outputUri = null; //真实的 uri
            outputUri = Uri.fromFile(cutfile);
            mCutUri = outputUri;
            // crop为true是设置在开启的intent中设置显示的view可以剪裁
            intent.putExtra("crop",true);
            // aspectX,aspectY 是宽高的比例，这里设置正方形
            intent.putExtra("aspectX",1);
            intent.putExtra("aspectY",1);
            //设置要裁剪的宽高
            intent.putExtra("outputX", 200); //200dp
            intent.putExtra("outputY",200);
            intent.putExtra("scale",true);
            //如果图片过大，会导致oom，这里设置为false
            intent.putExtra("return-data",false);
            if (imageUri != null) {
                intent.setDataAndType(imageUri, "image/*");
            }
            if (outputUri != null) {
                intent.putExtra(MediaStore.EXTRA_OUTPUT, outputUri);
            }
            intent.putExtra("noFaceDetection", true);
            //压缩图片
            intent.putExtra("outputFormat", Bitmap.CompressFormat.JPEG.toString());
            return intent;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public String getRealFilePath( final Context context, final Uri uri ) {
        if ( null == uri ) return null;
        final String scheme = uri.getScheme();
        String data = null;
        if ( scheme == null )
            data = uri.getPath();
        else if ( ContentResolver.SCHEME_FILE.equals( scheme ) ) {
            data = uri.getPath();
        } else if ( ContentResolver.SCHEME_CONTENT.equals( scheme ) ) {
            Cursor cursor = context.getContentResolver().query( uri, new String[] { MediaStore.Images.ImageColumns.DATA }, null, null, null );
            if ( null != cursor ) {
                if ( cursor.moveToFirst() ) {
                    int index = cursor.getColumnIndex( MediaStore.Images.ImageColumns.DATA );
                    if ( index > -1 ) {
                        data = cursor.getString( index );
                    }
                }
                cursor.close();
            }
        }
        return data;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.getInstance().onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.getInstance().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.getInstance().onStop();
    }
        
    @Override
    public void onBackPressed() {
        SDKWrapper.getInstance().onBackPressed();
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.getInstance().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.getInstance().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.getInstance().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onStart() {
        SDKWrapper.getInstance().onStart();
        super.onStart();
    }

    /**
     * 监听电池电量 BroadcastReceiver
     */
    public BroadcastReceiver mBatteryReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context arg0, Intent arg1) {
            int level = arg1.getIntExtra(BatteryManager.EXTRA_LEVEL,0);//BatteryManager
            app.battery_level = level;
        }
    };

    /**
     * 从相机获取图片
     */
    public static void getPicFromCamera() {
        //用于保存调用相机拍照后所生成的文件Environment
//        Log.i("田忌赛马", "唤起相机0");
//        app.tempFile = new File(Environment.getExternalStorageDirectory().getPath(), System.currentTimeMillis() + ".jpg");
//        //跳转到调用系统相机
//        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);//MediaStore
//        //判断版本
//        Log.i("田忌赛马", "唤起相机01");
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {   //如果在Android7.0以上,使用FileProvider获取Uri
//            Log.i("田忌赛马", "唤起相机011");
//            intent.setFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
//            Uri contentUri = FileProvider.getUriForFile(app, "com.hansion.chosehead", app.tempFile);//FileProvider
//            intent.putExtra(MediaStore.EXTRA_OUTPUT, contentUri);
//            Log.i("dasd", contentUri.toString());
//        } else {
//            //否则使用Uri.fromFile(file)方法获取Uri
//            Log.i("田忌赛马", "唤起相机0111");
//            intent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(app.tempFile));//MediaStore
//        }
//
        //创建一个file，用来存储拍照后的照片
        File outputfile = new File(app.getExternalCacheDir(),"output.png");
        try {
            if (outputfile.exists()){
                outputfile.delete();//删除
            }
            outputfile.createNewFile();
        } catch (Exception e) {
            e.printStackTrace();
        }
        Uri imageuri ;
        if (Build.VERSION.SDK_INT >= 24){
            imageuri = FileProvider.getUriForFile(app,
                    "com.tmjh.yjyl.keystore.fileprovider", //可以是任意字符串
                    outputfile);
        }else{
            imageuri = Uri.fromFile(outputfile);
        }
        //启动相机程序
        Intent intent = new Intent("android.media.action.IMAGE_CAPTURE");
        intent.putExtra(MediaStore.EXTRA_OUTPUT,imageuri);
        app.startActivityForResult(intent, CAMERA_REQUEST_CODE);
    }

    /**
     * 从相册获取图片
     */
    public static void getPicFromAlbm() {
        Intent photoPickerIntent = new Intent(Intent.ACTION_PICK);
        photoPickerIntent.setType("image/*");
        //photoPickerIntent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*");
        app.startActivityForResult(photoPickerIntent, ALBUM_REQUEST_CODE);

//        Intent intent = new Intent(Intent.ACTION_PICK, null);
//        intent.setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, IMAGE_UNSPECIFIED);
//        app.startActivityForResult(intent, PHOTOZOOM);
    }

    /**
     * 获取图片转换成的base64码
     */
    public static String getImgBase64() {
        return app.base64_str;
    }

    /**
     * 裁剪图片
     */
    public void cropPhoto(Uri uri) {
        Intent intent = new Intent("com.android.camera.action.CROP");
        intent.setDataAndType(uri, IMAGE_UNSPECIFIED);
        intent.putExtra("crop", "true");
        intent.putExtra(MediaStore.EXTRA_OUTPUT, uri);
        intent.putExtra("outputFormat", Bitmap.CompressFormat.JPEG.toString());
        intent.putExtra("aspectX", 1);
        intent.putExtra("aspectY", 1);
        intent.putExtra("outputX", 400);
        intent.putExtra("outputY", 400);
        intent.putExtra("return-data", true);
        intent.putExtra("outputFormat", Bitmap.CompressFormat.JPEG.toString());
        Log.i("田忌赛马", "裁剪1");
//        imageUri = uri;
//        Intent intent = new Intent("com.android.camera.action.CROP");
//        intent.setDataAndType(uri, "image/*");
//        intent.putExtra("crop", "true");
//        intent.putExtra("aspectX", 1);
//        intent.putExtra("aspectY", 1);
//        intent.putExtra("outputX", 400);
//        intent.putExtra("outputY", 400);
//        intent.putExtra("scale", true);
//        intent.putExtra(MediaStore.EXTRA_OUTPUT, uri);
//        intent.putExtra("return-data", false);
//        intent.putExtra("outputFormat", Bitmap.CompressFormat.JPEG.toString());
//        intent.putExtra("noFaceDetection", true); // no face detection
        app.startActivityForResult(intent, CROP_REQUEST_CODE);
        Log.i("田忌赛马", "裁剪2");
    }

    /**
     * 保存图片
     * @param name
     * @param bmp
     * @return
     */
    public String saveImage(String name, Bitmap bmp) {
        File appDir = new File(Environment.getExternalStorageDirectory().getPath());//Environment
        if (!appDir.exists()) {
            appDir.mkdir();
        }
        String fileName = name + ".jpg";
        File file = new File(appDir, fileName);
        try {
            FileOutputStream fos = new FileOutputStream(file);//FileOutputStream
            bmp.compress(Bitmap.CompressFormat.PNG, 100, fos);
            fos.flush();
            fos.close();
            return file.getAbsolutePath();
        } catch (IOException e) {
            //IOException
            e.printStackTrace();
        }
        return null;
    }

    //上传图片
    public static void uploadImage() {
        new Thread(new Runnable() {
            @Override
            public void run() {

                String uploadurl = "http://yjyl.tumujinhua.com/mobileqrcode/uploadsignimg.html";
                try {
                    File file = new File(app.img_src);
                    String result = UploadUtil.uploadImage(file, uploadurl);
                } catch (Exception e) {
                    e.printStackTrace();
                }

            }
        }).start();
    }

    @Override
    public void onPermissionsGranted(int requestCode, @NonNull List<String> perms) {

    };

    @Override
    public void onPermissionsDenied(int requestCode, @NonNull List<String> perms) {     //请求权限回调信息

    }

    /**
     * 请求微信登录
     */
    public static void loginWeChat() {
        Log.i("js", "请求微信登录");
        app.authorize();
    }

    /**
     * 返回微信信息
     * @param sex
     * @param headimgurl
     * @param unid
     * @param nickname
     */
    private void onWeChatLogin(final String sex, final String headimgurl, final String unid, final String nickname) {
        Log.i("js", "sex: " + sex + " unid: " + unid + " nickname: " + nickname + " headimgurl: " + headimgurl);
        runOnGLThread(new Runnable() {
            @Override
            public void run() {
                String paySuccessMsg = String.format("cc.NativeMsg.callBackUserInfo(\"" + sex + "\",\""+unid+"\",\""+nickname+"\",\"" + headimgurl + "\")");
                Cocos2dxJavascriptJavaBridge.evalString(paySuccessMsg);
            }
        });
    }

    /**
     * 授权
     */
    public void authorize(){
        JShareInterface.authorize(Wechat.Name, mAuthListener);
    }

    /**
     * 获取用户信息
     */
    public void getUserInfo(){
        JShareInterface.getUserInfo(Wechat.Name, mAuthListener);
    }

    /**
     * 授权、获取个人信息回调
     * action ：Platform.ACTION_AUTHORIZING 授权
     * Platform.ACTION_USER_INFO 获取个人信息
     */
    AuthListener mAuthListener = new AuthListener() {
        @Override
        public void onComplete(Platform platform, int action, BaseResponseInfo data) {
            String toastMsg = null;
            switch (action) {
                case Platform.ACTION_AUTHORIZING:
                    if (data instanceof AccessTokenInfo) {        //授权信息
                        String token = ((AccessTokenInfo) data).getToken();//token
                        long expiration = ((AccessTokenInfo) data).getExpiresIn();//token有效时间，时间戳
                        String refresh_token = ((AccessTokenInfo) data).getRefeshToken();//refresh_token
                        String openid = ((AccessTokenInfo) data).getOpenid();//openid
                        //授权原始数据，开发者可自行处理
                        String originData = data.getOriginData();
                        toastMsg = "授权成功:" + data.toString();
                        app.getUserInfo();
                    }
                    break;
                case Platform.ACTION_REMOVE_AUTHORIZING:
                    toastMsg = "删除授权成功";
                    break;
                case Platform.ACTION_USER_INFO:
                    if (data instanceof UserInfo) {      //第三方个人信息
                        String openid = ((UserInfo) data).getOpenid();  //openid
                        String name = ((UserInfo) data).getName();  //昵称
                        String imageUrl = ((UserInfo) data).getImageUrl();  //头像url
                        int gender = ((UserInfo) data).getGender();//性别, 1表示男性；2表示女性
                        //个人信息原始数据，开发者可自行处理
                        String originData = data.getOriginData();
                        toastMsg = "获取个人信息成功:" + data.toString();
                        Log.i("js", "获取个人信息成功");
                        app.onWeChatLogin(String.valueOf(gender), imageUrl, openid, name);
                    }
                    break;
            }
        }

        @Override
        public void onError(Platform platform, int action, int errorCode, Throwable error) {
            String toastMsg = null;
            switch (action) {
                case Platform.ACTION_AUTHORIZING:
                    toastMsg = "授权失败";
                    break;
                case Platform.ACTION_REMOVE_AUTHORIZING:
                    toastMsg = "删除授权失败";
                    break;
                case Platform.ACTION_USER_INFO:
                    toastMsg = "获取个人信息失败";
                    break;
            }
        }

        @Override
        public void onCancel(Platform platform, int action) {
            String toastMsg = null;
            switch (action) {
                case Platform.ACTION_AUTHORIZING:
                    toastMsg = "取消授权";
                    break;
                // TODO: 2017/6/23 删除授权不存在取消
                case Platform.ACTION_REMOVE_AUTHORIZING:
                    break;
                case Platform.ACTION_USER_INFO:
                    toastMsg = "取消获取个人信息";
                    break;
            }
        }
    };

    /**
     * 分享
     * @param shareTo 0好友，1朋友圈
     * @param type 2网页，1图片
     * @param title 标题
     * @param description 内容
     * @param webpageUrl 分享网页地址
     * @param imgPath 分享图片地址
     */
    public static void shareWeChat(int shareTo, int type, String title, String description, String webpageUrl, String imgPath) {
        app.doShareInfo(shareTo, type, title, description, webpageUrl, imgPath);
    }

    /**
     * 分享相关
     * @param shareTo
     * @param type
     * @param title
     * @param description
     * @param webpageUrl
     * @param imgPath
     */
    public void doShareInfo(int shareTo, int type, String title, String description, String webpageUrl, String imgPath){
        ShareParams shareParams = new ShareParams();
        if(type == 2){
            shareParams.setTitle(title);
            shareParams.setText(description);
            shareParams.setShareType(Platform.SHARE_WEBPAGE);
            shareParams.setUrl(webpageUrl);
            Bitmap logo = BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher);
            shareParams.setImageData(logo);
        }else if(type == 1){
            shareParams.setShareType(Platform.SHARE_IMAGE);
            shareParams.setImagePath(imgPath);
        }
        if(shareTo == 0){
            JShareInterface.share(Wechat.Name, shareParams, null);
        }else if(shareTo == 1){
            JShareInterface.share(WechatMoments.Name, shareParams, mPlatActionListener);
        }
    }

    /**
     * 分享监听
     */
    private PlatActionListener mPlatActionListener = new PlatActionListener() {
        @Override
        public void onComplete(Platform platform, int action, HashMap<String, Object> data) {
//                message.obj = "分享成功";
        }

        @Override
        public void onError(Platform platform, int action, int errorCode, Throwable error) {
//                message.obj = "分享失败:" + (error != null ? error.getMessage() : "") + "---" + errorCode;
        }

        @Override
        public void onCancel(Platform platform, int action) {
//                message.obj = "分享取消";
        }
    };

    /**
     * 爱约监听
     */
//    AiyueSDK addAiYueListener = new ShareResultImpl() {
//        @Override
//        public void login(int code, String openid) {
////            Log.i("ay","login,code="+code+",openid="+openid);
//        }
//
//        @Override
//        public void sendFriendsMessage(int i) {
////            Log.i("ay","sendFriendsMessage,i="+i);
//        }
//
//        @Override
//        public void sendShareCircle(int i) {
//            Log.i("ay","sendShareCircle,i="+i);
//        }
//    };
//
//    AiyueSDK.getLogin(this, appid);
}
