import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet, StatusBar } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import Colors from './src/constants/colors';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import DataScreen from './src/screens/DataScreen';
import JournalScreen from './src/screens/JournalScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import LogFlowScreen from './src/screens/LogFlowScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Softer, calming tab icons (simple unicode symbols)
const TAB_ICONS = {
  Home: { icon: '\u2302', label: 'Inicio' },       // ⌂ house
  Data: { icon: '\u25CB', label: 'Datos' },         // ○ circle
  Journal: { icon: '\u2661', label: 'Diario' },     // ♡ heart
  Chat: { icon: '\u2740', label: 'Chat' },          // ❀ flower
  Profile: { icon: '\u2726', label: 'Perfil' },     // ✦ star
};

function TabIcon({ name, focused }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={[
        styles.tabSymbol,
        focused ? styles.tabSymbolActive : styles.tabSymbolInactive,
      ]}>
        {TAB_ICONS[name].icon}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.divider,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 76,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '400',
          marginTop: 2,
          letterSpacing: 0.5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Data" component={DataScreen} options={{ tabBarLabel: 'Datos' }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ tabBarLabel: 'Diario' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="LogFlow"
            component={LogFlowScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabSymbol: {
    fontSize: 20,
  },
  tabSymbolActive: {
    color: Colors.primary,
  },
  tabSymbolInactive: {
    color: Colors.textMuted,
  },
});
