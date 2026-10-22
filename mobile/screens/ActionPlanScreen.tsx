import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

export default function ActionPlanScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Action Plan</Text>
        <Text style={styles.headerSubtitle}>Your child's care instructions</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Medical Info Banner */}
        <View style={styles.medicalBanner}>
          <Text style={styles.medicalBannerTitle}>Doctor / Clinic</Text>
          <Text style={styles.medicalBannerText}>Dr. Smith, Pediatric Pulmonology</Text>
          <Text style={styles.medicalBannerTitle}>Prescribed Medication</Text>
          <Text style={styles.medicalBannerText}>Rescue Inhaler: Salbutamol</Text>
        </View>

        {/* Green Zone */}
        <View style={[styles.zoneCard, styles.greenCard]}>
          <View style={[styles.zoneHeader, styles.greenHeader]}>
            <Text style={styles.zoneTitle}>Good (Green)</Text>
            <Text style={styles.zoneSubtitle}>Normal / follow routine care plan.</Text>
          </View>
          <View style={styles.zoneBody}>
            <Text style={styles.instruction}>• 1 puff Fluticasone (Preventer) morning/night</Text>
            <Text style={styles.instruction}>• Avoid triggers (smoke, strong scents)</Text>
          </View>
        </View>

        {/* Yellow Zone */}
        <View style={[styles.zoneCard, styles.yellowCard]}>
          <View style={[styles.zoneHeader, styles.yellowHeader]}>
            <Text style={styles.zoneTitle}>Caution (Yellow)</Text>
            <Text style={styles.zoneSubtitle}>Follow the caregiver's prescribed caution instructions.</Text>
          </View>
          <View style={styles.zoneBody}>
            <Text style={styles.instruction}>• Give 2 puffs of prescribed rescue inhaler</Text>
            <Text style={styles.instruction}>• Wait 15 mins, assess</Text>
            <Text style={styles.instruction}>• If symptoms continue, repeat and call doctor</Text>
          </View>
        </View>

        {/* Red Zone */}
        <View style={[styles.zoneCard, styles.redCard]}>
          <View style={[styles.zoneHeader, styles.redHeader]}>
            <Text style={styles.zoneTitle}>Emergency (Red)</Text>
            <Text style={styles.zoneSubtitle}>Follow the clinician-provided emergency plan and seek appropriate emergency help.</Text>
          </View>
          <View style={styles.zoneBody}>
            <Text style={styles.instruction}>• Call Emergency Services</Text>
            <Text style={styles.instruction}>• Give up to 6 puffs of prescribed rescue inhaler</Text>
            <Text style={styles.instruction}>• Wait 5 mins, repeat if no improvement while waiting for help</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  header: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F8D8E2',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D2530',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#786E76',
    marginTop: 4,
  },
  scrollContent: {
    padding: 24,
    gap: 20,
  },
  medicalBanner: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  medicalBannerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#786E76',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 8,
  },
  medicalBannerText: {
    fontSize: 16,
    color: '#2D2530',
    fontWeight: '600',
  },
  zoneCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  zoneHeader: {
    padding: 20,
  },
  zoneTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2530',
  },
  zoneSubtitle: {
    fontSize: 14,
    color: '#2D2530',
    marginTop: 4,
    lineHeight: 20,
    opacity: 0.8,
  },
  zoneBody: {
    padding: 20,
    gap: 12,
  },
  instruction: {
    fontSize: 16,
    color: '#2D2530',
    lineHeight: 24,
  },
  
  redCard: { borderColor: '#F8D8E2' },
  redHeader: { backgroundColor: '#D9304F' },
  
  yellowCard: { borderColor: '#FDEED2' },
  yellowHeader: { backgroundColor: '#E3A735' },
  
  greenCard: { borderColor: '#D4F0DF' },
  greenHeader: { backgroundColor: '#43A66B' },
});
