# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Aggressive optimization for smaller build size
-optimizations !code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# Remove debug/logging code in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

-keep class com.facebook.react.turbomodule.** { *; }
# Reanimated ships its own consumer rules; kept here only as belt-and-braces.
-keep class com.swmansion.reanimated.** { *; }

# Firebase Messaging
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# ProGuard annotations - Fix for missing proguard.annotation classes
-dontwarn proguard.annotation.**
-keep class proguard.annotation.** { *; }

# Keep annotations
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes SourceFile,LineNumberTable


# ---------------------------------------------------------------------------
# React Native view layer.
#
# RN's own consumer rules (ReactAndroid/proguard-rules.pro) keep bridge.**,
# turbomodule.core.** and @DoNotStrip/@ReactProp members, but they never keep
# com.facebook.react.views.** as whole classes. Under the New Architecture these
# view classes are resolved reflectively by name, so R8 sees no static reference
# and strips them. That produced:
#   java.lang.ClassNotFoundException: com.facebook.react.views.modal.ReactModalHostView
# which crashed release builds as soon as the first <Modal> rendered.
-keep,includedescriptorclasses class com.facebook.react.views.** { *; }
-keep,includedescriptorclasses class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.fabric.** { *; }

# Any ViewManager may be looked up the same way, including those from libraries.
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }
-keep class * extends com.facebook.react.uimanager.ViewGroupManager { *; }
-keep class * extends com.facebook.react.uimanager.SimpleViewManager { *; }

# ReactPackage implementations register the managers above.
-keep class * implements com.facebook.react.ReactPackage { *; }

# ---------------------------------------------------------------------------
# Glide - required by react-native-fast-image
# (FastImageOkHttpProgressGlideModule). Glide resolves modules reflectively.
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep class * extends com.bumptech.glide.module.AppGlideModule { <init>(...); }
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** { **[] $VALUES; public *; }
-keep class com.bumptech.glide.load.data.ParcelFileDescriptorRewinder$InternalRewinder { *(...); }
-dontwarn com.bumptech.glide.load.resource.bitmap.VideoDecoder

# ---------------------------------------------------------------------------
# WebView JS bridge. @JavascriptInterface methods are called by name from JS;
# R8 renames them otherwise and the bridge silently stops working.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.reactnativecommunity.webview.** { *; }

# ---------------------------------------------------------------------------
# OkHttp / Okio - the networking stack behind react-native-ssl-pinning.
# Certificate pinning failing open in a release build would be a security
# regression, so keep the whole pinning module and its transport.
-keep class com.toyberman.** { *; }
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-keep class okio.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# ---------------------------------------------------------------------------
# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# ---------------------------------------------------------------------------
# Kotlin metadata - several RN libraries are Kotlin and reflect over it.
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**

# ---------------------------------------------------------------------------
# Lottie reflects over its model classes when parsing animation JSON.
-keep class com.airbnb.lottie.** { *; }
-dontwarn com.airbnb.lottie.**

# ---------------------------------------------------------------------------
# react-native-screens uses Fragments resolved by name.
-keep class com.swmansion.rnscreens.** { *; }
-keep public class * extends androidx.fragment.app.Fragment

# ---------------------------------------------------------------------------
# PDF viewer + blob/fs modules
-keep class com.reactnativepdf.** { *; }
-keep class com.github.barteksc.pdfviewer.** { *; }
-dontwarn com.github.barteksc.**
-keep class com.RNFetchBlob.** { *; }
-keep class com.ReactNativeBlobUtil.** { *; }
