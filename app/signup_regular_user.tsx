import React, { useState } from 'react';
import axios from 'axios';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const LOGO = require('../assets/images/averl_logo.png');

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const goToNextStep = () => {
    if (!fullName.trim() || !username.trim() || !phone.trim()) {
      alert('Please fill all required fields');
      return;
    }
    setStep(2);
  };

  const goBack = () => {
    setStep(1);
  };

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await axios.post('http://192.168.100.7:8000/api/signup', {
        full_name: fullName.trim(),
        username: username.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        password: password,
        role: "regular"
      });

      console.log('Signup success:', response.data);

      // Save token and role
      await SecureStore.setItemAsync('userToken', response.data.token);
      await SecureStore.setItemAsync('userRole', response.data.user.role);

      alert('Account created successfully!');
      router.push('/(tabs)/home');
    } catch (error: any) {
      console.error('Signup error:', error.response?.data || error.message);
      const msg = error.response?.data?.detail || 'Something went wrong. Please try again.';
      alert(msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {step === 2 && (
          <TouchableOpacity style={styles.backArrow} onPress={goBack}>
            <Ionicons name="arrow-back" size={28} color="#B01409" />
          </TouchableOpacity>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View style={styles.logoContainer}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            </View>

            <Text style={styles.title}>Rescue AI</Text>

            {step === 1 ? (
              <>
                <Text style={styles.sectionTitle}>Create your account:</Text>

                <Text style={styles.label}>Full Name:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                  />
                </View>

                <Text style={styles.label}>Username:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your username"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                  />
                </View>

                <Text style={styles.label}>Phone Number:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={goToNextStep}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Almost there!</Text>

                <Text style={styles.label}>Address (optional):</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter your address"
                    placeholderTextColor="#999"
                  />
                </View>

                <Text style={styles.label}>Password:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <Text style={styles.label}>Confirm Password:</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.createbutton}
                    onPress={handleCreateAccount}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>Create Account</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 30,
    paddingBottom: 50,
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginTop: 30,
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: 'Raleway',
    fontWeight: '600',
    fontSize: 36,
    lineHeight: 42,
    color: '#B01409',
    textAlign: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 19,
    lineHeight: 28,
    color: '#1E1E1E',
    alignSelf: 'flex-start',
    marginBottom: 24,
    width: '100%',
  },
  label: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 26,
    color: '#1E1E1E',
    alignSelf: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    height: 45,
    borderWidth: 2,
    borderColor: '#B01409',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginTop:5,
    marginBottom: 27,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  input: {
    width: '100%',
    height: '100%',
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#1E1E1E',
  },
  button: {
    width: 180,
    height: 51,
    backgroundColor: '#B01409',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  createbutton: {
    width: 220,
    height: 51,
    backgroundColor: '#B01409',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 27,
    lineHeight: 40,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // ── New style for the back arrow ──
  backArrow: {
    position: 'absolute',
    top: 30,                    // adjust this value based on your safe area / notch
    left: 20,
    zIndex: 10,                 // make sure it's above other content
    padding: 8,                 // larger tap area
  },
});