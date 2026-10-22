import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Activity, CheckCircle2 } from 'lucide-react-native';
import { useFonts, Rubik_900Black, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Lora_400Regular, Lora_500Medium } from '@expo-google-fonts/lora';

const events = [
  { id: 1, type: 'wheeze', time: '11:42 PM', duration: '2m', severity: 'Sensor Alert', date: 'Today' },
  { id: 2, type: 'med', time: '11:45 PM', medicine: 'Prescribed Rescue Inhaler', dose: '2 puffs', date: 'Today', source: 'caregiver-entered care plan' },
  { id: 3, type: 'resolved', time: '12:15 AM', status: 'Alert acknowledged, monitoring continued', date: 'Today' }
];

export default function TimelineScreen() {
  const [fontsLoaded] = useFonts({
    Rubik_900Black,
    Rubik_700Bold,
    Lora_400Regular,
    Lora_500Medium,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timeline</Text>
        <Text style={styles.headerSubtitle}>Aarav's monitoring history</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {events.map((event, index) => (
          <View key={event.id} style={styles.eventRow}>
            
            {/* Timeline Line & Icon */}
            <View style={styles.timelineCol}>
              <View style={[styles.iconContainer, 
                event.type === 'wheeze' ? {borderColor: '#F8D8E2'} : 
                event.type === 'med' ? {borderColor: '#E6F0FF'} : {borderColor: '#D4F0DF'}
              ]}>
                {event.type === 'wheeze' ? <Activity color="#C92F5B" size={20} /> : 
                 event.type === 'med' ? <Clock color="#4D78C2" size={20} /> :
                 <CheckCircle2 color="#43A66B" size={20} />}
              </View>
              {index !== events.length - 1 && <View style={styles.line} />}
            </View>

            {/* Event Content */}
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTime}>{event.time} • {event.date}</Text>
                {event.severity && (
                  <View style={styles.severityBadge}>
                    <Text style={styles.severityBadgeText}>{event.severity}</Text>
                  </View>
                )}
              </View>
              
              {/* Event Card */}
              <View style={styles.eventCard}>
                {event.type === 'wheeze' && (
                  <Text style={styles.eventDesc}>Respiratory activity recorded ({event.duration})</Text>
                )}
                {event.type === 'med' && (
                  <View>
                    <Text style={styles.eventDesc}>Given {event.dose} of {event.medicine}</Text>
                    <Text style={styles.eventSource}>Source: {event.source}</Text>
                  </View>
                )}
                {event.type === 'resolved' && (
                  <Text style={styles.eventDesc}>{event.status}</Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFBF2',
  },
  header: {
    padding: 24,
    paddingTop: 10,
    backgroundColor: '#FFFBF2',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 28,
    color: '#2D2530',
  },
  headerSubtitle: {
    fontFamily: 'Lora_400Regular',
    fontSize: 16,
    color: '#786E76',
    marginTop: 4,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  eventRow: {
    flexDirection: 'row',
  },
  timelineCol: {
    alignItems: 'center',
    width: 48,
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 4,
    zIndex: 1,
    minHeight: 40,
  },
  eventContent: {
    flex: 1,
    paddingBottom: 32,
    paddingTop: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 12,
    color: '#A0969E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  eventDesc: {
    fontFamily: 'Lora_500Medium',
    fontSize: 16,
    color: '#2D2530',
    lineHeight: 24,
  },
  eventSource: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: '#786E76',
    fontStyle: 'italic',
    marginTop: 8,
  },
  severityBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  severityBadgeText: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 10,
    color: '#C92F5B',
    textTransform: 'uppercase',
  },
});
