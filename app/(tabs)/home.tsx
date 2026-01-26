//app/(tabs)/home.tsx
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const AMBULANCE_IMG = require('../../assets/images/ambulance_img.png');        
const CALL_HISTORY_IMG = require('../../assets/images/person_calling.jpg'); 

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
    
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Call for immediate emergency response</Text>
            <Text style={styles.cardDescription}>
              Get faster ambulance dispatch at your location, and receive aid for low critical emergencies.
            </Text>
          </View>
          <Image source={AMBULANCE_IMG} style={styles.cardImage} resizeMode="cover" />
        </View>

        {/*
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Set up your location for faster dispatch</Text>
            <Text style={styles.cardDescription}>
              Save your location before-hand for faster access and ambulance dispatch.
            </Text>
          </View>
          <Image source={MAP_IMG} style={styles.cardImage} resizeMode="cover" />
        </View> */}

        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>View your calling history</Text>
            <Text style={styles.cardDescription}>
              View your complete calling history with Rescue AI.
            </Text>
          </View>
          <Image source={CALL_HISTORY_IMG} style={styles.cardImage} resizeMode="cover" />
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  appName: {
    marginLeft: 8,
    fontFamily: 'Raleway',
    fontWeight: '600',
    fontSize: 32,
    color: '#B01409',
  },
  bell: {
    width: 36,
    height: 36,
    backgroundColor: '#AF100A',
    borderRadius: 18,
    marginLeft: 'auto',
    marginRight: 18,
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
});