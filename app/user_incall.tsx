import * as FileSystem from "expo-file-system/legacy";
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import * as SecureStore from 'expo-secure-store';


const LOGO = require("../assets/images/averl_logo.png");

const BACKEND_URL = "http://192.168.18.28:8000";
const VAD_THRESHOLD = -45;//prv it was -65 
const SILENCE_DURATION = 1800;
const CHECK_INTERVAL = 200;

export default function UserInCallScreen() {
  const router = useRouter();

  const [status, setStatus] = useState<
    "Initializing" | "Listening" | "Speaking" | "Processing" | "AI Speaking"
  >("Initializing");

  const [transcribedText, setTranscribedText] = useState("");
  const [assistantReply, setAssistantReply] = useState("");

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isSpeakingRef = useRef(false);
  const lastAudioTimeRef = useRef(Date.now());
  const callActiveRef = useRef(true);
  const startingRef = useRef(false);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    callActiveRef.current = true;

    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Microphone access is required.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      startRecordingLoop();
    })();

    return () => {
      callActiveRef.current = false;
      stopEverything();
    };
  }, []);

  /* ---------------- RECORD ---------------- */
  const startRecordingLoop = async () => {
    if (!callActiveRef.current) return;
    if (recordingRef.current || startingRef.current) return;

    startingRef.current = true;

    try {
      const recording = new Audio.Recording();

      await recording.prepareToRecordAsync({
        android: {
          extension: ".webm",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WEBM,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_OPUS,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
        },
        isMeteringEnabled: true,
      });

      recording.setOnRecordingStatusUpdate((s) => {
        if (!callActiveRef.current) return;
        if (s.metering !== undefined && s.metering > VAD_THRESHOLD) {
          lastAudioTimeRef.current = Date.now();
          if (!isSpeakingRef.current) {
            isSpeakingRef.current = true;
            setStatus("Speaking");
          }
        }
      });

      recordingRef.current = recording;
      await recording.startAsync();

      setStatus("Listening");
      isSpeakingRef.current = false;
      lastAudioTimeRef.current = Date.now();

      monitorIntervalRef.current = setInterval(checkSilence, CHECK_INTERVAL);
    } finally {
      startingRef.current = false;
    }
  };

  const checkSilence = () => {
    if (!callActiveRef.current || !isSpeakingRef.current) return;

    if (Date.now() - lastAudioTimeRef.current > SILENCE_DURATION) {
      processSpeech();
    }
  };

  /* ---------------- PROCESS ---------------- */
  const processSpeech = async () => {
    if (!recordingRef.current || !callActiveRef.current) return;

    clearInterval(monitorIntervalRef.current!);
    monitorIntervalRef.current = null;

    setStatus("Processing");

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;

    if (uri && callActiveRef.current) {
      sendToBackend(uri);
    }
  };

  /* ---------------- BACKEND ---------------- */
  const sendToBackend = async (uri: string) => {
    try {
      const formData = new FormData();
      // @ts-ignore
      formData.append("file", { uri, type: "audio/webm", name: "speech.webm" });

      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        router.push('/login');
        return;
      }


      const res = await fetch(`${BACKEND_URL}/chat_audio`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!callActiveRef.current) return;

      const data = await res.json();

      setTranscribedText(data.transcription || "");
      setAssistantReply(data.reply || "");

      if (!data.audio_base64) {
        setTimeout(startRecordingLoop, 300);
        return;
      }

      const fileUri = `${FileSystem.cacheDirectory}ai.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, data.audio_base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setStatus("AI Speaking");

      sound.setOnPlaybackStatusUpdate(async (s) => {
        if (s.didJustFinish && callActiveRef.current) {
          await sound.unloadAsync();
          soundRef.current = null;
          setTimeout(startRecordingLoop, 300);
        }
      });
    } catch (e) {
      console.error("Network error:", e);
      if (callActiveRef.current) {
        setTimeout(startRecordingLoop, 500);
      }
    }
  };

  /* ---------------- STOP ---------------- */
  const stopEverything = async () => {
    clearInterval(monitorIntervalRef.current!);

    if (recordingRef.current) {
      try { await recordingRef.current.stopAndUnloadAsync(); } catch {}
      recordingRef.current = null;
    }

    if (soundRef.current) {
      try { await soundRef.current.stopAsync(); } catch {}
      soundRef.current = null;
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <Text style={styles.title}>Rescue AI Call</Text>

        <View style={[
          styles.logoCircle,
          status === 'Speaking' && { borderColor: '#4CAF50', borderWidth: 4 },
          status === 'Processing' && { borderColor: '#FF9800', borderWidth: 4 }
        ]}>
          <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
        </View>

        <Text style={styles.statusText}>
          {status === 'Processing' ? 'AI is thinking...' : `Status: ${status}`}
        </Text>

        <View style={styles.transcriptContainer}>
          {transcribedText ? <Text style={styles.userText}>User: {transcribedText}</Text> : null}
          {assistantReply ? <Text style={styles.aiText}>AI: {assistantReply}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.endCallButton}
          onPress={async () => {
            callActiveRef.current = false;
            await stopEverything();
            router.replace('/call_summary'); 
            // router.back();
          }}
        >
          <View style={styles.endCallIcon} />
        </TouchableOpacity>
        
        {/* {isSaving && (
          <Text style={styles.savingText}>Saving call record...</Text>
        )} */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  contentBox: { width: 320, height: 600, borderWidth: 1.5, borderColor: '#AF100A', borderRadius: 20, alignItems: 'center', paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E1E1E', marginBottom: 40 },
  logoCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 1.5, borderColor: '#AF100A', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoImage: { width: 90, height: 90 },
  statusText: { fontSize: 16, color: '#666', marginBottom: 10 },
  transcriptContainer: { paddingHorizontal: 20, height: 160, width: '100%' },
  userText: { fontSize: 14, color: '#333', fontStyle: 'italic' },
  aiText: { fontSize: 14, color: '#AF100A', fontWeight: 'bold', marginTop: 5 },
  endCallButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 1.5, borderColor: '#AF100A', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  endCallIcon: { width: 30, height: 30, backgroundColor: '#B01409', borderRadius: 5 },
});