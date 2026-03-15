import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';

export default function CallScreen() {
  const router = useRouter();

  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [addressChoice, setAddressChoice] = useState<'saved' | 'new'>('saved');
  const [newAddress, setNewAddress] = useState('');

  // Load saved address from SecureStore on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await SecureStore.getItemAsync('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          if (user?.address) {
            setSavedAddress(user.address);
          }
        }
      } catch (e) {
        console.error('Failed to load user from SecureStore', e);
      }
    };
    loadUser();
  }, []);

  const handleCall = () => {
    const finalAddress =
      addressChoice === 'saved' && savedAddress
        ? savedAddress
        : newAddress.trim() || savedAddress || 'Not provided';

    if (!finalAddress || finalAddress === 'Not provided') {
      alert('Please provide an address (use saved or enter new one)');
      return;
    }

    router.push({
      pathname: '/user_incall',
      params: { address: finalAddress },
    });
  };

  const hasSavedAddress = !!savedAddress;

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

        {/* Address selection */}
        <View style={styles.addressSection}>
          <Text style={styles.label}>Delivery / Incident Address</Text>

          {hasSavedAddress ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={addressChoice}
                onValueChange={(itemValue: 'saved' | 'new') =>
                  setAddressChoice(itemValue)
                }
                style={styles.picker}
              >
                <Picker.Item
                  label={`${savedAddress}`}
                  value="saved"
                />
                <Picker.Item label="Enter a new address" value="new" />
              </Picker>
            </View>
          ) : (
            <Text style={styles.noSavedText}>
              No saved address found. Please enter one below.
            </Text>
          )}

          {(addressChoice === 'new' || !hasSavedAddress) && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newAddress}
                onChangeText={setNewAddress}
                placeholder="Enter full address here..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.callButton}
            activeOpacity={0.8}
            onPress={handleCall}
          >
            <Text style={styles.buttonText}>Call RescueAI</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  addressSection: {
    marginTop: 40,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  label: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '500',
    color: '#1E1E1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: '#B01409',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#1E1E1E',
  },
  noSavedText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#B01409',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#B01409',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  input: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#1E1E1E',
    textAlignVertical: 'top',
  },

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