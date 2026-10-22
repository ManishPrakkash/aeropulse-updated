import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Bluetooth, User, Bell, Shield, HelpCircle, ChevronRight, Activity } from 'lucide-react-native';

export default function SettingsScreen({ navigation }: any) {
  const renderSettingRow = (icon: any, title: string, subtitle?: string) => (
    <TouchableOpacity style={styles.settingRow}>
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight color="#786E76" size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage AeroPulse</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device & Connection</Text>
          <View style={styles.card}>
            {renderSettingRow(<Bluetooth color="#C92F5B" size={24} />, "Connected Sensor", "ESP32_Sensor - Connected")}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            {renderSettingRow(<User color="#4D78C2" size={24} />, "Child Profile", "Leo • 2 yrs")}
            <View style={styles.divider} />
            {renderSettingRow(<Activity color="#4D78C2" size={24} />, "Care Plan", "Dr. Smith • Prescribed rescue inhaler")}
            <View style={styles.divider} />
            {renderSettingRow(<Bell color="#4D78C2" size={24} />, "Notifications & Alarms")}
            <View style={styles.divider} />
            {renderSettingRow(<Shield color="#4D78C2" size={24} />, "Privacy & Sharing")}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            {renderSettingRow(<HelpCircle color="#786E76" size={24} />, "Help & Troubleshooting")}
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingIconContainer}>
                <View style={styles.versionIcon} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>About AeroPulse</Text>
                <Text style={styles.settingSubtitle}>Prototype Version 1.0.0</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: '#C92F5B'}]}>Presenter Tools</Text>
          <View style={[styles.card, {borderColor: '#C92F5B', borderWidth: 1}]}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => (navigation as any).navigate('Alarm')}
            >
              <View style={[styles.settingIconContainer, {backgroundColor: '#C92F5B'}]}>
                <Bell color="#FFFFFF" size={24} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, {color: '#C92F5B'}]}>Trigger Demo Alarm</Text>
                <Text style={styles.settingSubtitle}>Simulate a severe wheeze event</Text>
              </View>
              <ChevronRight color="#C92F5B" size={20} />
            </TouchableOpacity>
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
    gap: 32,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#786E76',
    marginLeft: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2530',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#786E76',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFF5F7',
    marginLeft: 84, // Aligned with text
  },
  versionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#786E76',
  }
});
