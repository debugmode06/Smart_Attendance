package com.eduport.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {

    private static final int CAMERA_PERMISSION_CODE = 101;
    private ScaleGestureDetector scaleGestureDetector;
    private boolean isScaling = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestCameraPermission();
        disableWebViewZoom();
        
        // Detect and block pinch gestures
        scaleGestureDetector = new ScaleGestureDetector(this, new ScaleGestureDetector.SimpleOnScaleGestureListener() {
            @Override
            public boolean onScale(ScaleGestureDetector detector) {
                return true; // Block scaling
            }
            
            @Override
            public boolean onScaleBegin(ScaleGestureDetector detector) {
                isScaling = true;
                return true; // Block scaling
            }
            
            @Override
            public void onScaleEnd(ScaleGestureDetector detector) {
                isScaling = false;
            }
        });
    }
    
    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        scaleGestureDetector.onTouchEvent(event);
        
        // Block multi-touch zoom gestures
        if (event.getPointerCount() > 1 || isScaling) {
            return true; // Consume event to block zoom
        }
        
        return super.dispatchTouchEvent(event);
    }

    private void disableWebViewZoom() {
        Bridge bridge = this.getBridge();
        if (bridge != null && bridge.getWebView() != null) {
            WebSettings webSettings = bridge.getWebView().getSettings();
            
            // Disable zoom controls
            webSettings.setSupportZoom(false);
            webSettings.setBuiltInZoomControls(false);
            webSettings.setDisplayZoomControls(false);
            
            // Disable text zoom
            webSettings.setTextZoom(100);
            
            // Enable viewport meta tag support
            webSettings.setUseWideViewPort(true);
            webSettings.setLoadWithOverviewMode(true);
            
            // Additional settings for better rendering
            webSettings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.TEXT_AUTOSIZING);
        }
    }

    private void requestCameraPermission() {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.CAMERA
        ) != PackageManager.PERMISSION_GRANTED) {

            ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.CAMERA},
                    CAMERA_PERMISSION_CODE
            );
        }
    }
}
