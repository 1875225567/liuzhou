package org.cocos2dx.javascript;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

import android.media.MediaRecorder;
import android.os.Environment;

public class VoiceRecorder {

	private static MediaRecorder mRecorder;
	private static String mDirString;
	private static String mCurrentFilePathString;

	private static boolean isPrepared;// ?????????

	/**
	 * ???????????????????????utton??????????????
	 * 
	 * @author nickming
	 *
	 */
	public interface AudioStageListener {
		void wellPrepared();
	}

	public static AudioStageListener mListener;

	public static void setOnAudioStageListener(AudioStageListener listener) {
		mListener = listener;
	}
	
	public static void setStorageDir(String fileDir){
		mDirString = fileDir;
	}
	
	public static String getStorageDir(){
		return mDirString;
	}

	//????
	public static void prepare(String fileNameString) {
		try {
			// ??????????false??
			isPrepared = false;

			File dir = new File(mDirString);
			if (!dir.exists()) {
				dir.mkdirs();
			}
			File file = new File(dir, fileNameString);

			mCurrentFilePathString = file.getAbsolutePath();
            //?????
			mRecorder = new MediaRecorder();
			// ?????????
			mRecorder.setOutputFile(file.getAbsolutePath());
			// ???meidaRecorder????????????
			mRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
			mRecorder.setAudioEncodingBitRate(4750);
			// ??????????????????amr
			mRecorder.setOutputFormat(MediaRecorder.OutputFormat.AMR_NB);
			// ???????????????amr
			mRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB);

			// ??????google???api?????ediaRecorder?????????
			mRecorder.prepare();

			mRecorder.start();
			// ??????
			isPrepared = true;
			// ??????????????????
			if (mListener != null) {
				mListener.wellPrepared();
			}

		} catch (IllegalStateException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	/**
	 * ??????????????
	 * 
	 * @return
	 */
	private static String generalFileName() {
		// TODO Auto-generated method stub

		return UUID.randomUUID().toString() + ".amr";
	}

	// ????????evel
	public static int getVoiceLevel(int maxLevel) {
		// mRecorder.getMaxAmplitude()??????????????????????1-32767
		if (isPrepared && mRecorder!=null) {
			try {
				// ???+1?????????7
				return maxLevel * mRecorder.getMaxAmplitude() / 32768 + 1;
			} catch (Exception e) {
				// TODO Auto-generated catch block

			}
		}

		return 1;
	}

	// ??????
	public static void release() {
		// ??????api??????
		if(mRecorder != null){
			mRecorder.stop();
			mRecorder.release();
			mRecorder = null;			
		}
	}

	// ???,???prepare??????????????????ancel??????????????????
	// ?????elease?????????
	public static void cancel() {
		release();
		if (mCurrentFilePathString != null) {
			File file = new File(mCurrentFilePathString);
			file.delete();
			mCurrentFilePathString = null;
		}

	}

	public static String getCurrentFilePath() {
		// TODO Auto-generated method stub
		return mCurrentFilePathString;
	}

}
