import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { RootStackParamList, BottomTabParamList } from '../types';
import { COLORS, FONT_SIZE } from '../constants/theme';

// Screens
import MapScreen from '../screens/MapScreen';
import LibraryScreen from '../screens/LibraryScreen';
import RecordingScreen from '../screens/RecordingScreen';
import SaveRouteScreen from '../screens/SaveRouteScreen';
import ReplayScreen from '../screens/ReplayScreen';
import GhostScreen from '../screens/GhostScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Carte',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{focused ? '🗺️' : '🗺️'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Parcours',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22 }}>{focused ? '📚' : '📚'}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
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
