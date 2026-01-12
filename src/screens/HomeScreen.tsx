import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Share,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TagChip } from '../components/TagChip';
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

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentQuote, loading, getNewQuote } = useQuotes();
  const { addFavorite, removeFavoriteById, isFavorite } = useFavoritesContext();

  const isCurrentFavorite = currentQuote ? isFavorite(currentQuote._id) : false;

  useEffect(() => {
    getNewQuote();
  }, []);

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
    getNewQuote();
  };

  return (
    <LinearGradient
      colors={['#E8A87C', '#C38D9E', '#85A5CC', '#C38D9E', '#E8A87C']}
      locations={[0, 0.3, 0.5, 0.7, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* Date Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.dateText}>{formatDate()}</Text>
      </View>

      {/* Quote Content */}
      <View style={styles.quoteContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#2D2D2D" />
        ) : currentQuote ? (
          <>
            <Text style={styles.quoteText}>"{currentQuote.content}"</Text>
            <Text style={styles.authorText}>{currentQuote.author.toUpperCase()}</Text>

            {/* Tags */}
            {currentQuote.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {currentQuote.tags.slice(0, 3).map((tag) => (
                  <TagChip key={tag} label={tag} variant="home" />
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.errorText}>Tap refresh to load a quote</Text>
        )}
      </View>

      {/* Action Buttons Section */}
      <View style={styles.actionsSection}>
        {/* Right side buttons (Heart & Share stacked) */}
        <View style={styles.rightButtons}>
          {/* Heart Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFavoriteToggle}
            disabled={loading || !currentQuote}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isCurrentFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isCurrentFavorite ? '#C4785A' : '#3D3D3D'}
            />
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            disabled={loading || !currentQuote}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={24} color="#3D3D3D" />
          </TouchableOpacity>
        </View>

        {/* Center Refresh Button */}
        <View style={styles.centerRefresh}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleNewQuote}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons name="sync" size={28} color="#FFFFFF" />
          </TouchableOpacity>
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
    fontSize: Math.min(13, width * 0.035),
    fontWeight: '500',
    color: 'rgba(45, 45, 45, 0.8)',
    letterSpacing: 2,
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
  },
  quoteText: {
    fontSize: Math.min(32, width * 0.08),
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: '#2D2D2D',
    textAlign: 'center',
    lineHeight: Math.min(44, width * 0.11),
    marginBottom: height * 0.03,
  },
  authorText: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: '500',
    color: 'rgba(45, 45, 45, 0.7)',
    letterSpacing: 3,
    marginBottom: height * 0.02,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
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
    gap: 16,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  centerRefresh: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  refreshButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(210, 180, 170, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  newInspirationText: {
    fontSize: Math.min(11, width * 0.028),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 2,
    marginTop: 12,
  },
});
