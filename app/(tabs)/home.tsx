// app/(tabs)/home.tsx
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState, useEffect } from 'react';

const AMBULANCE_IMG = require('../../assets/images/ambulance_img.png');        
const CALL_HISTORY_IMG = require('../../assets/images/person_calling.jpg'); 

export default function HomeScreen() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const getRole = async () => {
      const userRole = await SecureStore.getItemAsync('userRole');
      setRole(userRole); 
    };
    getRole();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userRole');
    router.push('/login');
  };

  if (role === null) {
    return <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading user role...</Text>;
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {role === 'regular' && (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Call for immediate emergency response</Text>
              <Text style={styles.cardDescription}>
                Get faster ambulance dispatch at your location, and receive aid for low critical emergencies.
              </Text>
            </View>
            <Image source={AMBULANCE_IMG} style={styles.cardImage} resizeMode="cover" />
          </View>
        )}

        {role === 'ambulance' && (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>View incoming emergency calls</Text>
              <Text style={styles.cardDescription}>
                Accept and respond to emergency dispatch requests in your area.
              </Text>
            </View>
            <Image source={AMBULANCE_IMG} style={styles.cardImage} resizeMode="cover" />
          </View>
        )}

        {role === 'admin' && (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Manage hospital administration</Text>
              <Text style={styles.cardDescription}>
                Update bed availability, view incoming patients, and coordinate with ambulances.
              </Text>
            </View>
            <Image source={CALL_HISTORY_IMG} style={styles.cardImage} resizeMode="cover" />
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Call history</Text>
            <Text style={styles.cardDescription}>
              View your previous calls and emergency responses.
            </Text>
          </View>
          <Image source={CALL_HISTORY_IMG} style={styles.cardImage} resizeMode="cover" />
        </View>

        <TouchableOpacity 
  onPress={async () => {
    const token = await SecureStore.getItemAsync('userToken');
    const role = await SecureStore.getItemAsync('userRole');
    alert(`Token: ${token ? 'exists ✓' : 'missing ✗'}\nRole: ${role || 'missing'}`);
  }}
  style={{ backgroundColor: '#eee', padding: 12, margin: 20, borderRadius: 8 }}
>
  <Text>Debug: Check saved session</Text>
</TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 120,
  },
  card: {
    width: 343,
    height: 194,
    marginBottom: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#AF100A',
    borderRadius: 10,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 26,
    color: '#1E1E1E',
    marginBottom: 8,
  },
  cardDescription: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#1E1E1E',
  },
  cardImage: {
    width: 103,
    height: 159,
    marginTop: 17,
    marginRight: 10,
    borderRadius: 10,
  },
  logoutButton: {
    width: 180,
    height: 51,
    backgroundColor: '#B01409',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 27,
    lineHeight: 40,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});