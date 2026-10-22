import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Vibration, Dimensions } from 'react-native';
import { AlertTriangle, Play, Pause, FastForward, Rewind, Heart } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function AlarmScreen({ navigation }: any) {
  
  useEffect(() => {
    const DURATION = 10000;
    const PATTERN = [1000, 2000, 1000, 2000];
    Vibration.vibrate(PATTERN, true);
    return () => Vibration.cancel();
  }, []);

  const handleAcknowledge = () => {
    Vibration.cancel();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      
      {/* Top Red Curved Background */}
      <View style={styles.topCurveContainer}>
        <View style={styles.topCurve}>
          <SafeAreaView>
            <View style={styles.headerArea}>
              <Text style={styles.demoBadge}>DEMO ALERT</Text>
            </View>
            <View style={styles.centerIcon}>
              <AlertTriangle color="#FFFFFF" size={120} opacity={0.8} />
            </View>
          </SafeAreaView>
        </View>
      </View>

      {/* Bottom Content Area */}
      <View style={styles.contentArea}>
        
        {/* Controls Row (styled like a media player) */}
        <View style={styles.controlsRow}>
          <Rewind color="#F8D8E2" size={24} />
          <TouchableOpacity onPress={handleAcknowledge} style={styles.playBtn}>
            <Pause color="#FFFFFF" size={24} fill="#FFFFFF" />
          </TouchableOpacity>
          <FastForward color="#F8D8E2" size={24} />
        </View>

        {/* Fake Waveform line (styled like image) */}
        <View style={styles.waveformRow}>
          <Text style={styles.timeText}>01:10</Text>
          <View style={styles.waveformCenter}>
             {/* Creating a simple bar visualizer */}
             {[...Array(20)].map((_, i) => (
                <View key={i} style={[
                  styles.waveBar, 
                  {height: 10 + Math.random() * 30, opacity: i < 8 ? 1 : 0.3}
                ]} />
             ))}
          </View>
          <Text style={styles.timeText}>02:30</Text>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>ATTENTION NEEDED</Text>
        <Text style={styles.subtitle}>By: AeroPulse ESP32 Sensor</Text>

        {/* Description / Instructions */}
        <Text style={styles.description}>
          The goal is to calm the breathing. Follow the prescribed care plan immediately.{"\n\n"}
          "Give 2 puffs of the prescribed rescue inhaler with the spacer."
        </Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7', // Bottom background
  },
  topCurveContainer: {
    height: height * 0.5,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  topCurve: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: '#C92F5B',
    top: -width * 1.05,
    left: -width * 0.25,
    alignItems: 'center',
    paddingTop: width * 1.05 + 40,
  },
  headerArea: {
    position: 'absolute',
    top: 60,
    width: width,
    alignItems: 'center',
  },
  demoBadge: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  centerIcon: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    padding: 30,
    paddingTop: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 30,
    marginTop: -40, // Pull up over the curve slightly like the image
  },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C92F5B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C92F5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  timeText: {
    fontSize: 12,
    color: '#786E76',
    fontWeight: '600',
  },
  waveformCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 40,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#C92F5B',
    borderRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D2530',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#2D2530',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#786E76',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  }
});
