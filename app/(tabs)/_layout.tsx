import { Tabs } from 'expo-router';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const LOGO=require('../../assets/images/averl_logo.png');
const HOME_ICON=require('../../assets/images/home_icon.png');//normal state
const HOME_ACTIVE_ICON=require('../../assets/images/home_active_icon.png');//focused state
const CONTACT_ICON=require('../../assets/images/contact_icon.png');//normal state
const CONTACT_ACTIVE_ICON=require('../../assets/images/contact_active_icon.png');//focused state
const HISTORY_ICON=require('../../assets/images/history_icon.png');//normal state
const HISTORY_ACTIVE_ICON=require('../../assets/images/history_active_icon.png');//focused state

function CustomHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top - 40 }]}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />

      <View style={styles.centerContainer}>
        <Text style={styles.appName}>Rescue AI</Text>
      </View>

      <TouchableOpacity style={styles.bell}>
        <Ionicons name="notifications-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <CustomHeader />
      <View style={styles.separator} />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            height: 85,
            paddingTop: 10,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          },
          headerShown: false,
          tabBarActiveTintColor: '#B01409',     
          tabBarInactiveTintColor: '#000000', 
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Poppins',             
            fontWeight: '500',
            marginBottom: 4,                     
          },
        }}
      >
        <Tabs.Screen 
          name="home" 
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, color, size }) => (
              <Image
                source={focused ? HOME_ACTIVE_ICON : HOME_ICON}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? '#B01409' : color,
                }}
                resizeMode="contain"
              />
            ),
          }}
        />

        <Tabs.Screen 
          name="location" 
          options={{
            title: 'Location',
            tabBarIcon: () => <Text>📍</Text>,
          }}
        />
         <Tabs.Screen 
          name="contact" 
          options={{
            title: 'Contact',
            tabBarIcon: ({ focused, color, size }) => (
              <Image
                source={focused ? CONTACT_ACTIVE_ICON : CONTACT_ICON}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? '#B01409' : color,
                }}
                resizeMode="contain"
              />
            ),
          }}
        />
        <Tabs.Screen 
          name="history" 
          options={{
            title: 'History',
            tabBarIcon: ({ focused, color, size }) => (
              <Image
                source={focused ? HISTORY_ACTIVE_ICON : HISTORY_ICON}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? '#B01409' : color,
                }}
                resizeMode="contain"
              />
            ),
          }}
        />
       
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },

  logo: {
    width: 45,
    height: 45,
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },

  appName: {
    fontFamily: 'Raleway',
    fontWeight: '600',
    fontSize: 28,
    color: '#B01409',
    letterSpacing: -0.3,
  },

  bell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B01409',
    justifyContent: 'center',
    alignItems: 'center',
  },

  separator: {
    height: 1.5,
    backgroundColor: '#B01409',
    marginTop: 5,
  },
});