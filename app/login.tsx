import React, { useState } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

const LOGO = require('../assets/images/averl_logo.png');

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Login pressed:', { username, password });
    router.push('/home');
  };

  const handleSignUp = () => {
    console.log('Sign up pressed');
    router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View style={styles.logoContainer}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            </View>

            <Text style={styles.title}>Rescue AI</Text>
            <Text style={styles.loginText}>Login to your account:</Text>

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

            <Text style={styles.label}>Password:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={true}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.dividerText}>or Don't have an account?</Text>

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
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
    flex: 1,
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
  loginText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 19,
    lineHeight: 28,
    color: '#1E1E1E',
    alignSelf: 'flex-start',
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 17,
    lineHeight: 26,
    color: '#1E1E1E',
    alignSelf: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    height: 36,
    borderWidth: 1.5,
    borderColor: '#B01409',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 30,
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
  loginButton: {
    width: 180,
    height: 51,
    backgroundColor: '#B01409',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  signUpButton: {
    width: 180,
    height: 51,
    backgroundColor: '#B01409',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 27,
    lineHeight: 40,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dividerText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 19,
    lineHeight: 28,
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: 10,
  },
});