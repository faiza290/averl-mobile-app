import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CallScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Make a call</Text>
        
        <View style={styles.centerContainer}>
          <Text style={styles.description}>
            You are about to make a call to{"\n"}RescueAI.{"\n\n\n\n"}
            Press the call button if you need an{"\n"}ambulance dispatch, or require{"\n"}medical first-aid advice{"\n"}for a low critical emergency.
          </Text>
        </View>
        
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.callButton}
            activeOpacity={0.8}
            onPress={() => router.push('/user_incall')}
          >
            <Text style={styles.buttonText}>Call RescueAI</Text>
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 29,
    lineHeight: 44,
    textAlign: 'center',
    color: '#1E1E1E',
    width: '100%',
    marginTop: 60,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 19,
    lineHeight: 28,
    textAlign: 'center',
    color: '#1E1E1E',
    width: 344,
  },
  bottomContainer: {
    marginBottom: 60, 
    alignItems: 'center',
  },
  callButton: {
    width: 260,
    height: 51,
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