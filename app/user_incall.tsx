import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

const LOGO = require('../assets/images/averl_logo.png');

export default function UserInCallScreen() {
  const router = useRouter();
  const [timer, setTimer] = useState<number>(0);
 
  const timerRef = useRef<number | null>(null);
  const isMounted = useRef<boolean>(true);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')} : ${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
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

  const handleEndCall = () => {
    isMounted.current = false;
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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

        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <View style={styles.endCallIcon} />
        </TouchableOpacity>
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
  endCallIcon: {
    width: 45,
    height: 45,
    backgroundColor: '#B01409',
    borderRadius: 22.5,
  },
});