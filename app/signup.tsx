import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

const AVERL_LOGO = require('../assets/images/averl_logo.png');
export default function SignupScreen() {
  const router = useRouter();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Image 
        source={AVERL_LOGO}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Rescue AI</Text>

      <Text style={styles.sectionTitle}>Choose your category:</Text>

      <TouchableOpacity 
        style={styles.categoryCard}
        activeOpacity={0.8}
      >
        <Text style={styles.categoryText}>Regular User</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.categoryCard}
        activeOpacity={0.8}
      >
        <Text style={styles.categoryText}>Ambulance Driver</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.categoryCard}
        activeOpacity={0.8}
      >
        <Text style={styles.categoryText}>Hospital Administration</Text>
      </TouchableOpacity>

      <Text style={styles.alreadyText}> Or </Text>

      <Text style={styles.alreadyText}>
        Already have an account?{' '}
        <Text 
          style={styles.loginLink}
          onPress={() => router.push('/login')}
        >
          Login
            {/* remove this line aage jakar, just for testing login. */}
          
        </Text>
      </Text>
    
      

      <TouchableOpacity 
        style={styles.loginButton}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/home')}
      >
        <Text style={styles.buttonText}>Signup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 60, 
  },

  logo: {
    width: 150,
    height: 150,
    marginTop: 50,
  },
  title: {
    marginTop: 12,           
    fontFamily: 'Raleway',  
    fontWeight: '600',
    fontSize: 36,
    lineHeight: 42,
    color: '#B01409',
    textAlign: 'center',
  },

  sectionTitle: {
    marginTop: 70, 
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 19,
    lineHeight: 28,
    color: '#1E1E1E',
    textAlign: 'center',
    width: '80%',
  },

  categoryCard: {
    width: 324,
    height: 66,
    marginTop: 20, 
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#B01409',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 19,
    lineHeight: 28,
    color: '#B01409',
    textAlign: 'center',
  },

  alreadyText: {
    marginTop: 35,           
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 19,
    lineHeight: 28,
    color: '#1E1E1E',
    textAlign: 'center',
    width: 290,
  },
  loginLink: {
    color: '#B01409',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  loginButton: {
    width: 180,
    height: 51,
    marginTop: 24,
    backgroundColor: '#B01409',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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