// app/user_incall.tsx
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const LOGO = require('../assets/images/averl_logo.png');

export default function UserInCallScreen() {
  const router = useRouter();
  const [timer, setTimer] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
 
  const timerRef = useRef<number | null>(null);
  const isMounted = useRef<boolean>(true);
  const startTimeRef = useRef<Date>(new Date());

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')} : ${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    startTimeRef.current = new Date();
    
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (!isMounted.current) {
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      isMounted.current = false;
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const saveCallRecord = async (durationSeconds: number) => {
    try {
      setIsSaving(true);
      const token = await SecureStore.getItemAsync('userToken');
      
      if (!token) {
        console.log('No token found, cannot save call record');
        return;
      }

      const duration = formatDuration(durationSeconds);
      
      await axios.post(
        'http://192.168.100.7:8000/api/call-records',
        { duration },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Call record saved successfully');
    } catch (error: any) {
      console.error('Error saving call record:', error.response?.data || error.message);
      // Don't show alert to user, just log the error
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndCall = async () => {
    isMounted.current = false;
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Save the call record
    await saveCallRecord(timer);
    
    // Navigate back
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <Text style={styles.title}>In call with Rescue AI</Text>

        <View style={styles.logoCircle}>
          <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
        </View>

        <Text style={styles.timer}>{formatTime(timer)}</Text>

        <TouchableOpacity 
          style={[styles.endCallButton, isSaving && styles.disabledButton]} 
          onPress={handleEndCall}
          disabled={isSaving}
        >
          <View style={styles.endCallIcon} />
        </TouchableOpacity>
        
        {isSaving && (
          <Text style={styles.savingText}>Saving call record...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  contentBox: {
    width: 309,
    height: 591,
    borderWidth: 1.5,
    borderColor: '#AF100A',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 29,
    lineHeight: 44,
    textAlign: 'center',
    color: '#1E1E1E',
    width: '100%',
    marginBottom: 60,
  },
  logoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1.5,
    borderColor: '#AF100A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 27,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  timer: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 19,
    lineHeight: 28,
    textAlign: 'center',
    color: '#1E1E1E',
    marginBottom: 28,
  },
  endCallButton: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    borderWidth: 1.5,
    borderColor: '#AF100A',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  endCallIcon: {
    width: 45,
    height: 45,
    backgroundColor: '#B01409',
    borderRadius: 22.5,
  },
  savingText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});