import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Wind, Cloud, Bluetooth, BellRing, Settings, Info, Home, ClipboardList, Clock, Activity } from 'lucide-react-native';
import Svg, { Polyline } from 'react-native-svg';
import { useFonts, Rubik_900Black, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Lora_400Regular, Lora_500Medium } from '@expo-google-fonts/lora';

const { width } = Dimensions.get('window');
const MAX_HISTORY = 40; 

const LiveGraph = ({ data, color, height = 80, maxValue = 500 }: { data: number[], color: string, height?: number, maxValue?: number }) => {
  const points = data.map((val, index) => {
    const x = (index / (MAX_HISTORY - 1)) * 100; 
    const clampedVal = Math.min(Math.max(val, 0), maxValue); 
    const y = 100 - ((clampedVal / maxValue) * 100); 
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={{ height, width: '100%' }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

export default function HomeScreen({ navigation }: any) {
  const [fontsLoaded] = useFonts({
    Rubik_900Black,
    Rubik_700Bold,
    Lora_400Regular,
    Lora_500Medium,
  });

  const [m1, setM1] = useState(0);
  const [m2, setM2] = useState(0);
  const [gas, setGas] = useState('Safe');
  const [pulse, setPulse] = useState('0');
  const [status, setStatus] = useState<'CALM' | 'ATTENTION' | 'ALERT'>('CALM');

  const [m1History, setM1History] = useState<number[]>(Array(MAX_HISTORY).fill(0));
  const [m2History, setM2History] = useState<number[]>(Array(MAX_HISTORY).fill(0));

  const [inputText, setInputText] = useState('192.168.1.XXX');
  const [wsIp, setWsIp] = useState('');
  const [wsStatus, setWsStatus] = useState('Disconnected');

  useEffect(() => {
    if (!wsIp || wsIp === '192.168.1.XXX' || wsIp.trim() === '') return;

    setWsStatus('Connecting...');
    const ws = new WebSocket(`ws://${wsIp}:3001`);

    ws.onopen = () => setWsStatus('Connected');
    ws.onclose = () => {
      setWsStatus('Disconnected');
      setStatus('CALM'); // reset status on disconnect
    };
    ws.onerror = () => setWsStatus('Error');

    ws.onmessage = (event) => {
      try {
        const text = event.data.toString();
        if (text.includes("M1:")) {
          const m1Match = text.match(/M1:(\d+)/);
          const m2Match = text.match(/M2:(\d+)/);
          const gasMatch = text.match(/Gas:(\w+)/);
          const hbMatch = text.match(/HB:(\d+)/);
          
          let currentM1 = 0, currentM2 = 0;

          if (m1Match) {
            currentM1 = parseInt(m1Match[1]);
            setM1(currentM1);
            setM1History(prev => [...prev.slice(1), currentM1]);
          }
          if (m2Match) {
            currentM2 = parseInt(m2Match[1]);
            setM2(currentM2);
            setM2History(prev => [...prev.slice(1), currentM2]);
          }
          if (gasMatch) setGas(gasMatch[1]);
          if (hbMatch) setPulse(hbMatch[1]);
          
          if (currentM1 > 300) setStatus('ALERT');
          else if (currentM1 > 150) setStatus('ATTENTION');
          else setStatus('CALM');
        }
      } catch (e) {
        console.log("Error parsing WS data", e);
      }
    };

    return () => ws.close();
  }, [wsIp]);

  if (!fontsLoaded) return null;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Hi, Aarav</Text>
            <Text style={styles.timeText}>{getTimeGreeting()}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <BellRing color="#2D2530" size={22} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Settings color="#2D2530" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Connection Status */}
        <View style={styles.connectionWrapper}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: wsStatus === 'Connected' ? '#43A66B' : (wsStatus === 'Connecting...' ? '#F5A623' : '#C92F5B') }
          ]} />
          <Text style={styles.connectionText}>
            {wsStatus === 'Connected' ? 'Sensor Connected' : (wsStatus === 'Connecting...' ? 'Connecting...' : 'Sensor Disconnected')}
          </Text>
        </View>

        {/* Dev IP Override (Hidden in prod, useful for prototype) */}
        {wsStatus !== 'Connected' && (
          <View style={{flexDirection: 'row', gap: 8, marginBottom: 20}}>
            <TextInput 
              style={[styles.devInput, {flex: 1, marginBottom: 0}]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="ESP32 IP Address"
            />
            <TouchableOpacity 
              style={{backgroundColor: '#C92F5B', justifyContent: 'center', paddingHorizontal: 16, borderRadius: 12}}
              onPress={() => setWsIp(inputText)}
            >
              <Text style={{color: '#FFF', fontFamily: 'Rubik_700Bold', fontSize: 14}}>Connect</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Circular Status */}
        <View style={styles.mainStatusContainer}>
          <View style={[
            styles.mainStatusCircle, 
            status === 'ALERT' ? styles.circleAlert : (status === 'ATTENTION' ? styles.circleAttention : styles.circleCalm),
            wsStatus !== 'Connected' && styles.circleDisconnected
          ]}>
            <Text style={[styles.mainStatusLabel, wsStatus !== 'Connected' && {color: '#A0969E'}]}>Respiratory Status</Text>
            
            <Text style={[
              styles.mainStatusValue, 
              status === 'ALERT' ? styles.textAlert : (status === 'ATTENTION' ? styles.textAttention : styles.textCalm),
              wsStatus !== 'Connected' && {color: '#786E76'}
            ]}>
              {wsStatus === 'Connected' ? status : 'WAITING'}
            </Text>
            
            <Text style={[styles.mainStatusSub, wsStatus !== 'Connected' && {color: '#A0969E'}]}>
              {wsStatus === 'Connected' 
                ? (status === 'CALM' ? 'Monitoring normally' : (status === 'ATTENTION' ? 'Possible abnormal pattern' : 'DEMO ALERT'))
                : 'Connect your AeroPulse sensor'}
            </Text>
          </View>
        </View>



        {/* Live Monitoring Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Monitoring</Text>
          <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
        </View>

        {/* 2x2 Metric Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridCard}>
            <Text style={styles.cardTitle}>Respiratory Sound</Text>
            <View style={styles.cardValueRow}>
              <Text style={styles.cardValueText}>M1 {wsStatus === 'Connected' ? m1 : '--'}</Text>
              <Text style={styles.cardValueText}>M2 {wsStatus === 'Connected' ? m2 : '--'}</Text>
            </View>
            <Text style={styles.cardSub}>Live sensor</Text>
          </View>
          
          <View style={styles.gridCard}>
            <Text style={styles.cardTitle}>Heart Rate</Text>
            <Text style={styles.cardValueText}>-- BPM</Text>
            <Text style={styles.cardSub}>Raw: {wsStatus === 'Connected' ? pulse : '--'}</Text>
          </View>
          
          <View style={styles.gridCard}>
            <Text style={styles.cardTitle}>Breathing Rate</Text>
            <Text style={styles.cardValueText}>-- breaths/min</Text>
            <Text style={styles.cardSub}>Analyzing...</Text>
          </View>
          
          <View style={styles.gridCard}>
            <Text style={styles.cardTitle}>Environment</Text>
            <Text style={styles.cardValueText}>{wsStatus === 'Connected' ? gas : '--'}</Text>
            <Text style={styles.cardSub}>Gas sensor</Text>
          </View>
        </View>

        {/* Respiratory Signal Card */}
        <View style={styles.largeCard}>
          <Text style={styles.cardTitle}>Respiratory Activity</Text>
          <Text style={styles.cardSub}>Live acoustic signal</Text>
          
          {wsStatus === 'Connected' ? (
            <View style={styles.graphContainer}>
              <LiveGraph data={m1History} color="#C92F5B" maxValue={500} />
              <View style={styles.graphOverlay}>
                 <LiveGraph data={m2History} color="#4D78C2" maxValue={500} />
              </View>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>WAITING FOR SENSOR</Text>
            </View>
          )}

          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#C92F5B'}]} /><Text style={styles.legendText}>Sound 1</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor: '#4D78C2'}]} /><Text style={styles.legendText}>Sound 2</Text></View>
          </View>
        </View>

        {/* AeroPulse Insights Card */}
        <View style={styles.largeCard}>
          <Text style={styles.cardTitle}>AeroPulse Insights</Text>
          <View style={styles.insightContent}>
            <Info color="#4D78C2" size={20} />
            <Text style={styles.insightText}>
              {wsStatus === 'Connected' 
                ? 'Respiratory monitoring is active and tracking normally.' 
                : 'Connect your sensor to receive AI monitoring insights.'}
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewInsightsText}>View insights →</Text>
          </TouchableOpacity>
        </View>



      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFBF2', // Extracted from Onboarding Form Area
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
    paddingBottom: 30, // Reduced from 100 to pull the content closer to the navbar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greetingText: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 24,
    color: '#2D2530',
  },
  timeText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 16,
    color: '#786E76',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  connectionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionText: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 12,
    color: '#2D2530',
  },
  devInput: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    fontFamily: 'Rubik_700Bold',
    color: '#2D2530',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mainStatusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainStatusCircle: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  circleCalm: {
    backgroundColor: '#F0FDF4',
    borderWidth: 8,
    borderColor: '#D4F0DF',
  },
  circleAttention: {
    backgroundColor: '#FFFBEB',
    borderWidth: 8,
    borderColor: '#FEF3C7',
  },
  circleAlert: {
    backgroundColor: '#FEF2F2',
    borderWidth: 8,
    borderColor: '#FEE2E2',
  },
  circleDisconnected: {
    backgroundColor: '#F5F5F5',
    borderWidth: 8,
    borderColor: '#EEEEEE',
  },
  mainStatusLabel: {
    fontFamily: 'Lora_500Medium',
    fontSize: 16,
    color: '#786E76',
    marginBottom: 8,
  },
  mainStatusValue: {
    fontFamily: 'Rubik_900Black',
    fontSize: 38,
    marginBottom: 8,
  },
  textCalm: {
    color: '#43A66B',
  },
  textAttention: {
    color: '#F5A623',
  },
  textAlert: {
    color: '#C92F5B',
  },
  mainStatusSub: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 14,
    color: '#786E76',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 20,
    color: '#2D2530',
  },
  viewAllText: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 14,
    color: '#C92F5B',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 14,
    color: '#2D2530',
    marginBottom: 12,
  },
  cardValueRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  cardValueText: {
    fontFamily: 'Rubik_900Black',
    fontSize: 18,
    color: '#C92F5B',
    marginBottom: 4,
  },
  cardSub: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: '#786E76',
  },
  largeCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  graphContainer: {
    height: 100, 
    width: '100%', 
    position: 'relative', 
    marginTop: 16,
    marginBottom: 10
  },
  graphOverlay: {
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0
  },
  emptyStateContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 10,
  },
  emptyStateText: {
    fontFamily: 'Rubik_700Bold',
    color: '#A0969E',
    fontSize: 12,
    letterSpacing: 1,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 12,
    color: '#786E76',
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightText: {
    fontFamily: 'Lora_500Medium',
    fontSize: 14,
    color: '#2D2530',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  viewInsightsText: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 14,
    color: '#4D78C2',
  },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderColor: '#F5F5F5',
  },
  navItem: {
    alignItems: 'center',
  },
  navItemActive: {
    alignItems: 'center',
  },
  navText: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 10,
    color: '#A0969E',
    marginTop: 4,
  },
  navTextActive: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 10,
    color: '#C92F5B',
    marginTop: 4,
  }
});
