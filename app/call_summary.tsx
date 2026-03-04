import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";

const BACKEND_URL = "http://192.168.18.28:8000";

export default function CallSummaryScreen() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {

       const token = await SecureStore.getItemAsync('userToken');
       if (!token) {
          router.push('/login');
          return;
        }
      
      
      const res = await fetch(`${BACKEND_URL}/clear_chat`, {
        method: 'POST',
         headers: { Authorization: `Bearer ${token}` },

      });

      if (!res.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Error',
        'Could not generate emergency report'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#AF100A" />
          <Text style={styles.loadingText}>
            Generating emergency report...
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.title}>Emergency Summary</Text>
          <Text style={styles.reportText}>
            {report || 'No report available'}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#AF100A',
    marginBottom: 20,
  },
  reportText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});
