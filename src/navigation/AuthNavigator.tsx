/**
 * Auth Navigator
 *
 * Stack navigation for authentication flow (Login, Sign Up, Forgot Password).
 * This navigator is shown when the user is not authenticated.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen, SignUpScreen, ForgotPasswordScreen } from '../screens/auth';
import { AuthStackParamList } from '../types';

// ============================================
// STACK NAVIGATOR
// ============================================

const Stack = createNativeStackNavigator<AuthStackParamList>();

// ============================================
// COMPONENT
// ============================================

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' },
      }}
      initialRouteName="Login"
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          // Prevent going back from login
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
