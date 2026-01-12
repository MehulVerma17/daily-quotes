/**
 * Collections Navigator
 *
 * Stack navigator for the Collections tab.
 * Includes Collections list and Collection detail screens.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CollectionsScreen, CollectionDetailScreen } from '../screens/collections';

export type CollectionsStackParamList = {
  Collections: undefined;
  CollectionDetail: { collectionId: string; collectionName: string };
};

const Stack = createNativeStackNavigator<CollectionsStackParamList>();

export const CollectionsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Collections" component={CollectionsScreen} />
      <Stack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
    </Stack.Navigator>
  );
};

export default CollectionsNavigator;
