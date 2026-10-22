import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Clock, ClipboardList, Settings as SettingsIcon } from 'lucide-react-native';
import { View, StyleSheet, Text, Platform } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import AlarmScreen from './screens/AlarmScreen';
import ActionPlanScreen from './screens/ActionPlanScreen';
import TimelineScreen from './screens/TimelineScreen';
import SettingsScreen from './screens/SettingsScreen';
import OnboardingScreen from './screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true, 
        tabBarLabel: ({ focused }) => {
          let label = route.name;
          if (route.name === 'Plan') label = 'Action';
          
          return (
            <Text style={{
              fontSize: 10,
              fontWeight: 'bold',
              color: focused ? '#C92F5B' : '#A0969E',
              marginTop: 4,
            }}>
              {label}
            </Text>
          );
        },
        tabBarIcon: ({ focused }) => {
          let IconComponent;
          if (route.name === 'Home') IconComponent = Home;
          else if (route.name === 'Timeline') IconComponent = Clock;
          else if (route.name === 'Plan') IconComponent = ClipboardList; 
          else if (route.name === 'Settings') IconComponent = SettingsIcon;

          return (
            <View style={styles.iconWrapper}>
              <IconComponent color={focused ? '#C92F5B' : '#A0969E'} size={24} />
            </View>
          );
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderColor: '#F5F5F5',
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 95 : 80,
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Timeline" component={TimelineScreen} />
      <Tab.Screen name="Plan" component={ActionPlanScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="Alarm" 
          component={AlarmScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 10,
    borderRadius: 20,
  },
  iconWrapperActive: {
    // No background in the image, just a deeper color for the icon, but let's keep it clean
  }
});
