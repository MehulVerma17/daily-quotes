import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedQuote } from '../types';

const { width } = Dimensions.get('window');

interface QuoteCardProps {
  quote: SavedQuote;
  onRemoveFavorite: (id: string) => void;
  onShare: (quote: SavedQuote) => void;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'
  ];
  return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
};

// Animated Icon Button
const IconButton: React.FC<{
  onPress: () => void;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
}> = ({ onPress, iconName, color, size = 22 }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.actionButton, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name={iconName} size={size} color={color} />
      </Animated.View>
    </Pressable>
  );
};

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onRemoveFavorite,
  onShare,
}) => {
  const primaryTag = quote.tags.length > 0 ? quote.tags[0].toUpperCase() : 'INSPIRATION';

  const cardScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, { transform: [{ scale: cardScale }] }]}>
        <View style={styles.header}>
          <Text style={styles.tagDate}>
            {primaryTag} • {formatDate(quote.savedAt)}
          </Text>
        </View>

        <Text style={styles.quoteText}>"{quote.content}"</Text>

        <View style={styles.footer}>
          <Text style={styles.author}>{quote.author.toUpperCase()}</Text>

          <View style={styles.actions}>
            <IconButton
              onPress={() => onRemoveFavorite(quote._id)}
              iconName="heart"
              color="#C4785A"
            />
            <IconButton
              onPress={() => onShare(quote)}
              iconName="share-outline"
              color="#8B7355"
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: width * 0.05,
    marginHorizontal: width * 0.05,
    marginVertical: 10,
    shadowColor: '#8B7355',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    marginBottom: 14,
  },
  tagDate: {
    fontSize: Math.min(11, width * 0.028),
    fontWeight: '600',
    color: '#9B8579',
    letterSpacing: 1.5,
  },
  quoteText: {
    fontSize: Math.min(18, width * 0.045),
    fontStyle: 'italic',
    color: '#2D2D2D',
    lineHeight: Math.min(28, width * 0.07),
    fontFamily: 'serif',
    marginBottom: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F0EB',
    paddingTop: 14,
  },
  author: {
    fontSize: Math.min(11, width * 0.028),
    fontWeight: '600',
    color: '#2D2D2D',
    letterSpacing: 1.5,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 6,
  },
});
