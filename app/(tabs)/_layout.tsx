import { Tabs } from 'expo-router';
import { Image, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('../../assets/images/averl_logo.png');

function CustomHeader() {
    const insets = useSafeAreaInsets();
    
    return (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            <View style={styles.centerContainer}>
                <Text style={styles.appName}>Rescue AI</Text>
            </View>
            <View style={styles.bell} />
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
                }}
            >
                <Tabs.Screen 
                    name="home" 
                    options={{
                        title: 'Home',
                        tabBarIcon: () => <Text>🏠</Text>,
                    }}
                />
                <Tabs.Screen 
                    name="call" 
                    options={{
                        title: 'Call',
                        tabBarIcon: () => <Text>📞</Text>,
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
                    name="history" 
                    options={{
                        title: 'History',
                        tabBarIcon: () => <Text>📜</Text>,
                    }}
                />
                <Tabs.Screen 
                    name="contact" 
                    options={{
                        title: 'Contact',
                        tabBarIcon: () => <Text>📱</Text>,
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 68,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: { 
        width: 50, 
        height: 50 
    },
    appName: {
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
    },
    separator: {
        height: 1.5,
        backgroundColor: '#B01409',
        marginTop: -1,
    },
});