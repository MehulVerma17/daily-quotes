import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Share,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuotes } from '../hooks/useQuotes';
import { useFavoritesContext } from '../context';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const formatDate = (): string => {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];
  const now = new Date();
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
};

// Animated Button Component
const AnimatedButton: React.FC<{
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  children: React.ReactNode;
}> = ({ onPress, disabled, style, children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
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
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentQuote, loading, getNewQuote } = useQuotes();
  const { addFavorite, removeFavoriteById, isFavorite } = useFavoritesContext();

  const isCurrentFavorite = currentQuote ? isFavorite(currentQuote._id) : false;

  // Animation values
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const quoteTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    getNewQuote();
  }, []);

  useEffect(() => {
    if (currentQuote && !loading) {
      quoteOpacity.setValue(0);
      quoteTranslateY.setValue(20);
      Animated.parallel([
        Animated.timing(quoteOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(quoteTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentQuote]);

  const handleFavoriteToggle = async () => {
    if (!currentQuote) return;

    if (isCurrentFavorite) {
      await removeFavoriteById(currentQuote._id);
    } else {
      await addFavorite(currentQuote);
    }
  };

  const handleShare = async () => {
    if (!currentQuote) return;

    try {
      await Share.share({
        message: `"${currentQuote.content}"\n\n— ${currentQuote.author}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share quote',
      });
    }
  };

  const handleNewQuote = () => {
    Animated.timing(quoteOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      getNewQuote();
    });
  };

  return (
    <LinearGradient
      colors={['#E8A87C', '#D4A5A5', '#A8B5C4', '#C9B8A8', '#E8A87C']}
      locations={[0, 0.25, 0.5, 0.75, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Date Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.dateText}>{formatDate()}</Text>
      </View>

      {/* Quote Content */}
      <View style={styles.quoteContainer}>
        {loading && !currentQuote ? (
          <ActivityIndicator size="large" color="#2D2D2D" />
        ) : currentQuote ? (
          <Animated.View
            style={[
              styles.quoteWrapper,
              {
                opacity: quoteOpacity,
                transform: [{ translateY: quoteTranslateY }],
              },
            ]}
          >
            <Text style={styles.quoteText}>"{currentQuote.content}"</Text>
            <Text style={styles.authorText}>— {currentQuote.author.toUpperCase()}</Text>
          </Animated.View>
        ) : (
          <Text style={styles.errorText}>Tap refresh to load a quote</Text>
        )}
      </View>

      {/* Action Buttons Section */}
      <View style={styles.actionsSection}>
        {/* Right side buttons (Heart & Share stacked) */}
        <View style={styles.rightButtons}>
          {/* Heart Button */}
          <AnimatedButton
            onPress={handleFavoriteToggle}
            disabled={loading || !currentQuote}
            style={styles.actionButton}
          >
            <Ionicons
              name={isCurrentFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isCurrentFavorite ? '#C4785A' : '#3D3D3D'}
            />
          </AnimatedButton>

          {/* Share Button */}
          <AnimatedButton
            onPress={handleShare}
            disabled={loading || !currentQuote}
            style={styles.actionButton}
          >
            <Ionicons name="share-outline" size={24} color="#3D3D3D" />
          </AnimatedButton>
        </View>

        {/* Center Refresh Button */}
        <View style={styles.centerRefresh}>
          <AnimatedButton
            onPress={handleNewQuote}
            disabled={loading}
            style={styles.refreshButton}
          >
            <View style={styles.refreshInner}>
              <Ionicons name="sync" size={26} color="#FFFFFF" />
            </View>
          </AnimatedButton>
          <Text style={styles.newInspirationText}>NEW INSPIRATION</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dateText: {
    fontSize: Math.min(12, width * 0.03),
    fontWeight: '500',
    color: 'rgba(45, 45, 45, 0.6)',
    letterSpacing: 3,
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  quoteWrapper: {
    alignItems: 'center',
  },
  quoteText: {
    fontSize: Math.min(28, width * 0.07),
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: '#2D2D2D',
    textAlign: 'center',
    lineHeight: Math.min(42, width * 0.105),
    paddingHorizontal: 10,
  },
  authorText: {
    fontSize: Math.min(13, width * 0.032),
    fontWeight: '500',
    color: 'rgba(45, 45, 45, 0.55)',
    letterSpacing: 4,
    marginTop: height * 0.03,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(45, 45, 45, 0.7)',
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: width * 0.08,
    paddingBottom: 24,
  },
  rightButtons: {
    position: 'absolute',
    right: width * 0.08,
    top: 0,
    alignItems: 'center',
    gap: 14,
  },
  actionButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerRefresh: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
  },
  refreshButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(180, 140, 130, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  refreshInner: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    backgroundColor: 'rgba(160, 120, 110, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newInspirationText: {
    fontSize: Math.min(10, width * 0.025),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 2.5,
    marginTop: 14,
  },
});
