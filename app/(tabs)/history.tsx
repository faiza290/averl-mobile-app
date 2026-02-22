// app/(tabs)/history.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

interface CallRecord {
  id: string;
  timestamp: string;
  duration: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchCallHistory();
    }, [])
  );

  const fetchCallHistory = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get('http://192.168.100.7:8000/api/call-history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Call history response:', response.data);
      setCallHistory(response.data.calls);
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (utcString: string) => {
  const date = new Date(utcString + 'Z'); // ← this line changed
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  };
  return new Intl.DateTimeFormat('en-GB', options).format(date).replace(/\//g, '-');
};

const formatTime = (utcString: string) => {
  const date = new Date(utcString + 'Z');
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  return new Intl.DateTimeFormat('en-GB', options).format(date);
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calling History</Text>

      <View style={styles.centerWrapper}>
        <View style={styles.tableContainer}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.dateHeader]}>Date & Time</Text>
            <View style={styles.verticalDivider} />
            <Text style={[styles.headerCell, styles.durationHeader]}>Duration</Text>
          </View>

          {/* Body */}
          <ScrollView style={styles.tableBody}>
            {loading ? (
              <Text style={styles.messageText}>Loading...</Text>
            ) : callHistory.length === 0 ? (
              <Text style={styles.messageText}>No call history yet</Text>
            ) : (
              callHistory.map((call, index) => (
                <View key={call.id}>
                  <View style={styles.tableRow}>
                    <View style={styles.dateColumn}>
                      <Text style={styles.dateText}>{formatDate(call.timestamp)}</Text>
                      <Text style={styles.timeText}>{formatTime(call.timestamp)}</Text>
                    </View>

                    <View style={styles.verticalDivider} />

                    {/* Right column: Duration centered */}
                    <Text style={styles.durationText}>{call.duration}</Text>
                  </View>

                  {index < callHistory.length - 1 && <View style={styles.rowBorder} />}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 28,
    textAlign: 'center',
    color: '#1E1E1E',
    marginTop: 24,
    marginBottom: 16,
  },
  centerWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#B01409',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  tableHeader: {
    flexDirection: 'row',
    height: 54,
    backgroundColor: '#FFF5F5',
    borderBottomWidth: 1.5,
    borderBottomColor: '#B01409',
  },
  headerCell: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: '#B01409',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  dateHeader: {
    flex: 1.1,
  },
  durationHeader: {
    flex: 0.9,
  },
  verticalDivider: {
    width: 1.5,
    backgroundColor: '#B01409',
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 68,
    alignItems: 'center',
  },
  dateColumn: {
    flex: 1.1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  dateText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
    color: '#1E1E1E',
    textAlign: 'center',
  },
  timeText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginTop: 2,
  },
  durationText: {
    flex: 0.9,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 18,
    color: '#1E1E1E',
    textAlign: 'center',
  },
  rowBorder: {
    height: 1.5,
    backgroundColor: '#B01409',
    opacity: 0.4,
  },
  messageText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#777',
    fontFamily: 'Poppins',
  },
});