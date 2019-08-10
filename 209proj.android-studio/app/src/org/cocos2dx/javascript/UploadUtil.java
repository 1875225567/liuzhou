package org.cocos2dx.javascript;

import android.util.Log;

import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

/**
 * 图片上传工具类
 */

public class UploadUtil {
    private static final String TAG = "uploadFile";
    private static final int TIME_OUT = 10 * 1000;//超时时间
    private static final String CHARSET = "utf-8";//设置编码

    /**
     * android上传文件到服务器
     *
     * @param file       需要上传的文件File
     * @param RequestURL  请求的url
     * @return 返回响应的内容
     */
    public static String uploadImage(File file, String RequestURL) {
        String result = "error";
        String BOUNDARY = UUID.randomUUID().toString();//边界标识 随机生成UUID
        String PREFIX = "--", LINE_END = "\r\n";
        String CONTENT_TYPE = "multipart/form-data";//内容类型
        try {
            URL url = new URL(RequestURL);//URL
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();//HttpURLConnection
            conn.setReadTimeout(TIME_OUT);
            conn.setConnectTimeout(TIME_OUT);
            conn.setDoInput(true);//允许输入流
            conn.setDoOutput(true);//允许输出流
            conn.setUseCaches(false);//不允许使用缓存
            conn.setRequestMethod("POST");//请求方式
            conn.setRequestProperty("Charset", CHARSET);//设置编码
            conn.setRequestProperty("connection", "keep-alive");
            conn.setRequestProperty("Content-Type", CONTENT_TYPE + ";boundary=" + BOUNDARY);
            conn.connect();

            if (file != null) {
                //当文件不为空，把文件包装并且上传
                DataOutputStream dos = new DataOutputStream(conn.getOutputStream());//DataOutputStream
                dos.writeBytes(PREFIX + BOUNDARY + LINE_END);
                dos.writeBytes("Content-Disposition: form-data; " + "name=\"inputName\";filename=\"" + file.getName() + "\"" + LINE_END);
                dos.writeBytes(LINE_END);

                FileInputStream is = new FileInputStream(file);//FileInputStream
                byte[] bytes = new byte[1024];
                int len = -1;
                while ((len = is.read(bytes)) != -1) {
                    dos.write(bytes, 0, len);
                }
                is.close();
                dos.write(LINE_END.getBytes());

                byte[] end_data = (PREFIX + BOUNDARY + PREFIX + LINE_END).getBytes();
                dos.write(end_data);
                dos.flush();
                /*
                 * 获取响应码  200=成功
                 * 当响应成功，获取响应的流
                 */
                int res = conn.getResponseCode();
                if (res == 200) {
                    InputStream input = conn.getInputStream();//InputStream
                    StringBuilder sbs = new StringBuilder();
                    int ss;
                    while ((ss = input.read()) != -1) {
                        sbs.append((char) ss);
                    }
                    result = sbs.toString();
                    Log.i(TAG, "result------------------>>" + result);
                }
            }
        } catch (IOException e) {
            //IOException
            e.printStackTrace();
        }
        return result;
    }

    private static String getMIMEType(File file) {
        String fileName = file.getName();
        if (fileName.endsWith("png") || fileName.endsWith("PNG")) {
            return "image/png";
        } else {
            return "image/jpg";
        }
    }
}
