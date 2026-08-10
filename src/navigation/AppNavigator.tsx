import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, BottomTabParamList } from '../types';
import { useThemeStore } from '../stores/themeStore';
import HamburgerMenu from '../components/HamburgerMenu';

// Screens
import MapScreen from '../screens/MapScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RecordingScreen from '../screens/RecordingScreen';
import SaveRouteScreen from '../screens/SaveRouteScreen';
import ReplayScreen from '../screens/ReplayScreen';
import GhostScreen from '../screens/GhostScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <HamburgerMenu {...props} />}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const colors = useThemeStore((s) => s.colors);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Recording"
          component={RecordingScreen}
          options={{
            title: 'Enregistrement',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="SaveRoute"
          component={SaveRouteScreen}
          options={{
            title: 'Sauvegarder',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Replay"
          component={ReplayScreen}
          options={{
            title: 'Replay',
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="Ghost"
          component={GhostScreen}
          options={{
            title: 'Mode Fantôme',
            headerTransparent: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
