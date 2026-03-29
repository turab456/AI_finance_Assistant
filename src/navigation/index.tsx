import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, List, PieChart as PieChartIcon, User as UserIcon } from 'lucide-react-native';

// Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeStep from '../screens/onboarding/WelcomeStep';
import IncomeTypeStep from '../screens/onboarding/IncomeTypeStep';
import MonthlyIncomeStep from '../screens/onboarding/MonthlyIncomeStep';
import SpendingGoalStep from '../screens/onboarding/SpendingGoalStep';
import CompletionStep from '../screens/onboarding/CompletionStep';
import HomeScreen from '../screens/main/HomeScreen';
import TransactionsScreen from '../screens/main/TransactionsScreen';
import InsightsScreen from '../screens/main/InsightsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationPermissionScreen from '../screens/NotificationPermissionScreen';

import { COLORS } from '../utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const OnboardingStack = createNativeStackNavigator();

const OnboardingNavigator = () => (
  <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
    <OnboardingStack.Screen name="Welcome" component={WelcomeStep} />
    <OnboardingStack.Screen name="IncomeType" component={IncomeTypeStep} />
    <OnboardingStack.Screen name="MonthlyIncome" component={MonthlyIncomeStep} />
    <OnboardingStack.Screen name="SpendingGoal" component={SpendingGoalStep} />
    <OnboardingStack.Screen name="Completion" component={CompletionStep} />
  </OnboardingStack.Navigator>
);

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textLight,
      tabBarStyle: {
        height: 70,
        paddingBottom: 12,
        paddingTop: 8,
        backgroundColor: COLORS.card,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{
        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Transactions" 
      component={TransactionsScreen} 
      options={{
        tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Insights" 
      component={InsightsScreen} 
      options={{
        tabBarIcon: ({ color, size }) => <PieChartIcon size={size} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{
        tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

import TransactionDetailScreen from '../screens/main/TransactionDetailScreen';

const MainStack = createNativeStackNavigator();

const MainNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="Tabs" component={MainTabNavigator} />
    <MainStack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
  </MainStack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
