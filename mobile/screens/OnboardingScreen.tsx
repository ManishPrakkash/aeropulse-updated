import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, Image, FlatList, TouchableOpacity, ScrollView, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Baby, Pill, Bluetooth, BellRing, CheckCircle2, ChevronRight, Stethoscope, Wind, Check, Calendar, Activity, Phone } from 'lucide-react-native';
import { useFonts, Rubik_900Black, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Lora_400Regular, Lora_500Medium } from '@expo-google-fonts/lora';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { RussoOne_400Regular } from '@expo-google-fonts/russo-one';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  { id: '1', type: 'welcome' },
  { id: '2', type: 'child' },
  { id: '3', type: 'history' },
  { id: '4', type: 'care_team' },
  { id: '5', type: 'pair' },
  { id: '6', type: 'permissions' },
];

const DIAGNOSTICS_LIST = [
  'Primary respiratory sensor', 
  'Secondary respiratory sensor', 
  'Pulse sensor', 
  'Environment sensor'
];

export default function OnboardingScreen({ navigation }: any) {
  const [fontsLoaded] = useFonts({
    Rubik_900Black,
    Rubik_700Bold,
    Lora_400Regular,
    Lora_500Medium,
    Pacifico_400Regular,
    RussoOne_400Regular,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Step 1: Child Profile
  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState('');
  
  // Step 2: Medical Context
  const [wheezeHist, setWheezeHist] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [triggers, setTriggers] = useState<string[]>([]);

  // Step 3: Care Team
  const [pediatricianName, setPediatricianName] = useState('');
  const [hospitalClinic, setHospitalClinic] = useState('');
  const [contactNum, setContactNum] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [preferredHospital, setPreferredHospital] = useState('');

  // Step 4: Sensor Connection
  const [sensorState, setSensorState] = useState<'idle' | 'scanning' | 'connected'>('idle');
  const [checkedCount, setCheckedCount] = useState(0);

  if (!fontsLoaded) return null;

  // Validation
  const isStep1Valid = childName.trim().length > 0 && dateOfBirth !== null;
  const isStep2Valid = wheezeHist !== '' && diagnosis !== '';
  const isStep3Valid = pediatricianName.trim().length > 0 && hospitalClinic.trim().length > 0 && emergencyContact.trim().length === 10 && preferredHospital.trim().length > 0;

  const handlePhoneChange = (text: string) => {
    const formatted = text.replace(/[^0-9]/g, '');
    setContactNum(formatted);
  };

  const handleEmergencyPhoneChange = (text: string) => {
    const formatted = text.replace(/[^0-9]/g, '');
    setEmergencyContact(formatted);
  };

  const handleDateChange = (date: any) => {
    // Depending on the exact lib version, it might pass event or date directly. 
    // Safely extract the date object:
    const selectedDate = (date && date instanceof Date) ? date : (date?.nativeEvent?.timestamp ? new Date(date.nativeEvent.timestamp) : null);
    
    if (Platform.OS === 'android') setShowDatePicker(false);
    
    if (selectedDate) {
      setDateOfBirth(selectedDate);
      const today = new Date();
      let ageNum = today.getFullYear() - selectedDate.getFullYear();
      if(today.getMonth() < selectedDate.getMonth() || (today.getMonth() === selectedDate.getMonth() && today.getDate() < selectedDate.getDate())) {
        ageNum--;
      }
      setAge(`${Math.max(0, ageNum)} years`);
    }
  };

  const handleDismiss = () => {
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.replace('Main');
    }
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (currentIndex !== roundIndex) {
      setCurrentIndex(roundIndex);
    }
  };

  const toggleTrigger = (t: string) => {
    setTriggers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  const startSensorScan = () => {
    setSensorState('scanning');
    
    // Simulate 2 seconds of Bluetooth scanning
    setTimeout(() => {
      setSensorState('connected');
      
      // Start ticking off the diagnostics
      let currentTick = 0;
      const interval = setInterval(() => {
        currentTick++;
        setCheckedCount(currentTick);
        if (currentTick >= DIAGNOSTICS_LIST.length) {
          clearInterval(interval);
        }
      }, 700); 

    }, 2000);
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <View style={styles.slide}>
        {item.type === 'welcome' && (
          <View style={styles.welcomeSlide}>
            <View style={styles.swirl1} />
            <View style={styles.swirl2} />
            <View style={styles.swirl3} />
            <View style={styles.swirl4} />

            <SafeAreaView style={styles.headerSafeArea}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.welcomeText}>Welcome To,</Text>
                <Text style={styles.brandText}>AeroPulse</Text>
              </View>
            </SafeAreaView>

            <View style={styles.bottomWhiteArea}>
              <View style={styles.whiteCurve} />
              
              <Image 
                source={require('../assets/meditating_girl.png')} 
                style={styles.heroImage}
                resizeMode="contain"
              />

              <Text style={styles.welcomeDesc}>Continuous, AI-powered respiratory monitoring for your little one's peace of mind.</Text>

              <TouchableOpacity style={styles.getStartedBtn} onPress={handleNext}>
                <Text style={styles.getStartedText}>Get Started</Text>
                <ChevronRight color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {item.type !== 'welcome' && (
          <View style={styles.formSlide}>
            <SafeAreaView style={styles.headerSafeArea}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.stepText}>Step {index}</Text>
              </View>
            </SafeAreaView>

            <View style={styles.bottomWhiteAreaForm}>
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                
                {/* STEP 1: Child Profile */}
                {item.type === 'child' && (
                  <View style={styles.formContainer}>
                    <Baby color="#C92F5B" size={48} style={{marginBottom: 16}} />
                    <Text style={styles.formTitle}>Tell us about your little one</Text>
                    
                    <TextInput 
                      style={styles.input} 
                      value={childName} 
                      onChangeText={setChildName} 
                      placeholder="Child's Name" 
                    />
                    
                    <TouchableOpacity style={styles.datePickerBtn} onPress={openDatePicker} activeOpacity={0.7}>
                      <Calendar color="#786E76" size={20} style={{marginRight: 10}} />
                      <Text style={[styles.datePickerText, !dateOfBirth && styles.datePickerPlaceholder]}>
                        {dateOfBirth ? dateOfBirth.toLocaleDateString() : "Date of birth"}
                      </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={dateOfBirth || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onValueChange={handleDateChange}
                        onDismiss={handleDismiss}
                        maximumDate={new Date()}
                      />
                    )}
                    
                    {Platform.OS === 'ios' && showDatePicker && (
                      <TouchableOpacity style={styles.iosDoneBtn} onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.iosDoneText}>Done</Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.inputRowReadOnly}>
                      <Text style={styles.readOnlyLabel}>Age:</Text>
                      <Text style={styles.readOnlyValue}>{age || '--'}</Text>
                    </View>

                    <TouchableOpacity 
                      style={[styles.finishBtn, !isStep1Valid && styles.finishBtnDisabled]} 
                      onPress={handleNext}
                      disabled={!isStep1Valid}
                    >
                      <Text style={styles.finishBtnText}>Next Step</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STEP 2: Respiratory History */}
                {item.type === 'history' && (
                  <View style={styles.formContainer}>
                    <Wind color="#C92F5B" size={48} style={{marginBottom: 16}} />
                    <Text style={styles.formTitle}>Medical Context</Text>

                    <Text style={styles.questionLabel}>Has your child experienced wheezing before?</Text>
                    {['Never', 'Occasionally', 'Frequently', 'Under medical evaluation'].map(opt => (
                      <TouchableOpacity key={opt} style={[styles.radioBtn, wheezeHist === opt && styles.radioBtnActive]} onPress={() => setWheezeHist(opt)}>
                        <View style={[styles.radioDot, wheezeHist === opt && styles.radioDotActive]} />
                        <Text style={[styles.radioText, wheezeHist === opt && styles.radioTextActive]}>{opt}</Text>
                      </TouchableOpacity>
                    ))}

                    <Text style={[styles.questionLabel, {marginTop: 20}]}>Diagnosed with a respiratory condition?</Text>
                    {['Yes', 'No', 'Not diagnosed', 'Prefer not to say'].map(opt => (
                      <TouchableOpacity key={opt} style={[styles.radioBtn, diagnosis === opt && styles.radioBtnActive]} onPress={() => setDiagnosis(opt)}>
                        <View style={[styles.radioDot, diagnosis === opt && styles.radioDotActive]} />
                        <Text style={[styles.radioText, diagnosis === opt && styles.radioTextActive]}>{opt}</Text>
                      </TouchableOpacity>
                    ))}

                    <Text style={[styles.questionLabel, {marginTop: 20}]}>Known Triggers (Optional)</Text>
                    <View style={styles.pillContainer}>
                      {['Dust', 'Smoke', 'Pollen', 'Pets', 'Cold air', 'Exercise', 'Infections'].map(t => (
                        <TouchableOpacity key={t} style={[styles.pillBtn, triggers.includes(t) && styles.pillBtnActive]} onPress={() => toggleTrigger(t)}>
                          <Text style={[styles.pillText, triggers.includes(t) && styles.pillTextActive]}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity 
                      style={[styles.finishBtn, !isStep2Valid && styles.finishBtnDisabled]} 
                      onPress={handleNext}
                      disabled={!isStep2Valid}
                    >
                      <Text style={styles.finishBtnText}>Next Step</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STEP 3: Care Team */}
                {item.type === 'care_team' && (
                  <View style={styles.formContainer}>
                    <Stethoscope color="#C92F5B" size={48} style={{marginBottom: 16}} />
                    <Text style={styles.formTitle}>Doctor & Emergency</Text>
                    
                    <TextInput 
                      style={styles.input} 
                      placeholder="Pediatrician/Doctor Name" 
                      value={pediatricianName}
                      onChangeText={setPediatricianName}
                    />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Hospital/Clinic" 
                      value={hospitalClinic}
                      onChangeText={setHospitalClinic}
                    />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Contact Number (Optional)" 
                      keyboardType="phone-pad" 
                      value={contactNum}
                      onChangeText={handlePhoneChange}
                      maxLength={10}
                    />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Emergency Contact Number" 
                      keyboardType="phone-pad" 
                      value={emergencyContact}
                      onChangeText={handleEmergencyPhoneChange}
                      maxLength={10}
                    />
                    <TextInput 
                      style={styles.input} 
                      placeholder="Preferred Hospital" 
                      value={preferredHospital}
                      onChangeText={setPreferredHospital}
                    />

                    <TouchableOpacity 
                      style={[styles.finishBtn, !isStep3Valid && styles.finishBtnDisabled]} 
                      onPress={handleNext}
                      disabled={!isStep3Valid}
                    >
                      <Text style={styles.finishBtnText}>Next Step</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STEP 4: Sensor Setup */}
                {item.type === 'pair' && (
                  <View style={styles.formContainer}>
                    <Bluetooth color="#C92F5B" size={48} style={{marginBottom: 16}} />
                    <Text style={styles.formTitle}>Connect AeroPulse</Text>
                    
                    {sensorState === 'idle' && (
                      <TouchableOpacity style={styles.scanBtn} onPress={startSensorScan}>
                        <Bluetooth color="#FFFFFF" size={24} style={{marginRight: 8}} />
                        <Text style={styles.finishBtnText}>Scan for Sensor</Text>
                      </TouchableOpacity>
                    )}

                    {sensorState === 'scanning' && (
                      <View style={styles.scanningCard}>
                        <ActivityIndicator color="#C92F5B" size="large" />
                        <Text style={styles.scanningText}>Searching nearby devices...</Text>
                      </View>
                    )}

                    {sensorState === 'connected' && (
                      <>
                        <View style={styles.pairingCardSuccess}>
                          <CheckCircle2 color="#43A66B" size={24} />
                          <View style={{marginLeft: 12}}>
                            <Text style={styles.pairingText}>ESP32_Sensor</Text>
                            <Text style={styles.pairingSub}>Connected via Bluetooth</Text>
                          </View>
                        </View>

                        <View style={styles.checklistCard}>
                          <Text style={styles.checklistTitle}>Hardware Diagnostics</Text>
                          {DIAGNOSTICS_LIST.map((sys, idx) => (
                            <View key={sys} style={styles.checklistItem}>
                              {idx < checkedCount ? (
                                <Check color="#43A66B" size={18} />
                              ) : (
                                <View style={styles.emptyCheck} />
                              )}
                              <Text style={[styles.checklistItemText, idx >= checkedCount && {color: '#D1CDD0'}]}>{sys}</Text>
                            </View>
                          ))}
                        </View>

                        <TouchableOpacity 
                          style={[styles.finishBtn, checkedCount < 4 && styles.finishBtnDisabled]} 
                          onPress={handleNext}
                          disabled={checkedCount < 4}
                        >
                          <Text style={styles.finishBtnText}>Next Step</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}

                {/* STEP 5: Permissions */}
                {item.type === 'permissions' && (
                  <View style={styles.formContainer}>
                    <BellRing color="#C92F5B" size={48} style={{marginBottom: 16}} />
                    <Text style={styles.formTitle}>Permissions</Text>
                    
                    <View style={styles.permissionItem}>
                      <View style={styles.permIcon}><Bluetooth color="#C92F5B" size={20} /></View>
                      <View style={{flex: 1}}>
                        <Text style={styles.permTitle}>Bluetooth</Text>
                        <Text style={styles.permDesc}>Required to stream live sensor data.</Text>
                      </View>
                    </View>

                    <View style={styles.permissionItem}>
                      <View style={styles.permIcon}><BellRing color="#C92F5B" size={20} /></View>
                      <View style={{flex: 1}}>
                        <Text style={styles.permTitle}>Night-time Notifications</Text>
                        <Text style={styles.permDesc}>AeroPulse may notify you when the monitoring system detects an event requiring your attention.</Text>
                      </View>
                    </View>

                    <View style={styles.permissionItem}>
                      <View style={styles.permIcon}><Activity color="#C92F5B" size={20} /></View>
                      <View style={{flex: 1}}>
                        <Text style={styles.permTitle}>Background Operation</Text>
                        <Text style={styles.permDesc}>Keep tracking safely while your phone is locked.</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity style={styles.finishBtn} onPress={handleNext}>
                      <Text style={styles.finishBtnText}>Complete Setup</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {currentIndex > 0 && (
        <View style={styles.paginationContainer}>
          {ONBOARDING_DATA.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                currentIndex === i ? styles.activeDot : styles.inactiveDot
              ]} 
            />
          ))}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D73B67', 
  },
  slide: {
    width,
    height: '100%',
  },
  welcomeSlide: {
    flex: 1,
    backgroundColor: '#D73B67',
    overflow: 'hidden',
  },
  swirl1: {
    position: 'absolute',
    width: width * 2.5,
    height: width * 2.5,
    borderRadius: width * 1.25,
    backgroundColor: 'rgba(255,255,255,0.06)', 
    top: -width * 0.5,
    left: -width * 0.8,
  },
  swirl2: {
    position: 'absolute',
    width: width * 1.8,
    height: width * 1.8,
    borderRadius: width * 0.9,
    backgroundColor: 'rgba(255,255,255,0.04)', 
    top: height * 0.15,
    left: -width * 0.7,
  },
  swirl3: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(255,255,255,0.05)', 
    top: height * 0.3,
    left: -width * 0.2,
  },
  swirl4: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(255,255,255,0.03)', 
    top: height * 0.45,
    left: -width * 0.4,
  },
  formSlide: {
    flex: 1,
    backgroundColor: '#D73B67',
  },
  headerSafeArea: {
    paddingHorizontal: 30,
    paddingTop: 20,
    zIndex: 10,
  },
  headerTextContainer: {
    marginTop: 40,
  },
  welcomeText: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 28, 
    color: '#FFFFFF',
    marginBottom: -4, 
  },
  brandText: {
    fontFamily: 'RussoOne_400Regular',
    fontSize: 56, 
    color: '#FFFFFF',
    marginBottom: 24,
    letterSpacing: 1,
  },
  stepText: {
    fontFamily: 'Rubik_900Black',
    fontSize: 46,
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -1,
  },
  bottomWhiteArea: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.72, 
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  whiteCurve: {
    position: 'absolute',
    bottom: -50,
    width: width * 2, 
    height: height * 0.68,
    backgroundColor: '#FFFBF2', 
    borderTopLeftRadius: 1000,
    borderTopRightRadius: 1000,
    alignSelf: 'center',
  },
  heroImage: {
    width: width * 1.0, 
    height: height * 0.45,
    marginBottom: 20, 
  },
  welcomeDesc: {
    fontFamily: 'Lora_500Medium',
    color: '#786E76',
    textAlign: 'center',
    paddingHorizontal: 40,
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 24,
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C92F5B',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    marginBottom: 60,
    shadowColor: '#C92F5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedText: {
    fontFamily: 'Rubik_700Bold',
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
  bottomWhiteAreaForm: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#FFFBF2',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  scrollContent: {
    padding: 30,
    paddingTop: 40,
    paddingBottom: 80, 
  },
  formContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  formTitle: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 22,
    color: '#2D2530',
    marginBottom: 24,
    width: '100%',
  },
  input: {
    fontFamily: 'Rubik_700Bold',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    color: '#2D2530',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  datePickerText: {
    fontFamily: 'Rubik_700Bold',
    fontSize: 16,
    color: '#2D2530',
    flex: 1,
  },
  datePickerPlaceholder: {
    color: '#A0969E',
  },
  iosDoneBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  iosDoneText: {
    color: '#C92F5B',
    fontFamily: 'Rubik_700Bold',
    fontSize: 16,
  },
  inputRowReadOnly: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F8D8E2',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  readOnlyLabel: {
    fontFamily: 'Rubik_700Bold',
    color: '#C92F5B',
    fontSize: 16,
  },
  readOnlyValue: {
    fontFamily: 'Rubik_900Black',
    color: '#9F2348',
    fontSize: 16,
  },
  questionLabel: {
    fontFamily: 'Rubik_700Bold',
    color: '#786E76',
    fontSize: 15,
    marginBottom: 12,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  radioBtnActive: {
    backgroundColor: '#F8D8E2',
    borderColor: '#C92F5B',
    borderWidth: 1,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
  },
  radioDotActive: {
    borderColor: '#C92F5B',
    backgroundColor: '#C92F5B',
    borderWidth: 5,
  },
  radioText: {
    fontFamily: 'Rubik_700Bold',
    color: '#2D2530',
    fontSize: 15,
  },
  radioTextActive: {
    color: '#9F2348',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  pillBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  pillBtnActive: {
    backgroundColor: '#C92F5B',
  },
  pillText: {
    fontFamily: 'Rubik_700Bold',
    color: '#786E76',
    fontSize: 14,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  scanBtn: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#C92F5B',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#D73B67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  scanningCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scanningText: {
    fontFamily: 'Rubik_700Bold',
    color: '#786E76',
    fontSize: 14,
    marginTop: 16,
  },
  pairingCardSuccess: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4', 
    borderColor: '#43A66B',
    borderWidth: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  pairingSub: {
    fontFamily: 'Lora_500Medium',
    color: '#43A66B',
    fontSize: 13,
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  checklistTitle: {
    fontFamily: 'Rubik_700Bold',
    color: '#2D2530',
    fontSize: 16,
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistItemText: {
    fontFamily: 'Rubik_700Bold',
    color: '#786E76',
    fontSize: 14,
    marginLeft: 10,
  },
  emptyCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    width: '100%',
  },
  permIcon: {
    backgroundColor: '#F8D8E2',
    padding: 10,
    borderRadius: 12,
    marginRight: 16,
  },
  permTitle: {
    fontFamily: 'Rubik_700Bold',
    color: '#2D2530',
    fontSize: 16,
    marginBottom: 4,
  },
  permDesc: {
    fontFamily: 'Lora_400Regular',
    color: '#786E76',
    fontSize: 14,
    lineHeight: 20,
  },
  finishBtn: {
    width: '100%',
    backgroundColor: '#D73B67',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#D73B67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  finishBtnDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  finishBtnText: {
    fontFamily: 'Rubik_900Black',
    color: '#FFFFFF',
    fontSize: 18,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20, 
    backgroundColor: '#D73B67',
  },
  inactiveDot: {
    width: 6,  
    backgroundColor: '#E0E0E0',
  }
});
