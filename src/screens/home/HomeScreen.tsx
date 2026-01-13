/**
 * Home Screen
 *
 * Main home screen with Quote of the Day, categories, and discover feed.
 * Features infinite scrolling for the Discover More section.
 * Matches design from image 4.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore, useFavoritesStore } from '../../stores';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES } from '../../constants/theme';
import { Quote } from '../../types';
import { getQuoteOfDay, getQuotes } from '../../services/quoteService';
import { CATEGORIES } from '../../config';
import { AddToCollectionModal, ShareQuoteModal } from '../../components';

type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  Category: { category: string };
};

const PAGE_SIZE = 10;

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  // Zustand stores
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const { toggleFavorite, isFavorite, loadFavorites } = useFavoritesStore();

  // State
  const [quoteOfDay, setQuoteOfDay] = useState<Quote | null>(null);
  const [discoverQuotes, setDiscoverQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Collection modal state
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [selectedQuoteForCollection, setSelectedQuoteForCollection] = useState<Quote | null>(null);

  // Share modal state
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [quoteToShare, setQuoteToShare] = useState<Quote | null>(null);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Friend';

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [qotd, quotes] = await Promise.all([
        getQuoteOfDay(),
        getQuotes(1, PAGE_SIZE),
      ]);
      setQuoteOfDay(qotd);
      setDiscoverQuotes(quotes.data);
      setHasMore(quotes.hasMore);
      setPage(1);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more quotes for infinite scroll
  const loadMoreQuotes = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const quotes = await getQuotes(nextPage, PAGE_SIZE);
      // Deduplicate to prevent duplicate key errors
      setDiscoverQuotes((prev) => {
        const existingIds = new Set(prev.map(q => q.id));
        const newQuotes = quotes.data.filter(q => !existingIds.has(q.id));
        return [...prev, ...newQuotes];
      });
      setHasMore(quotes.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more quotes:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load favorites when user changes
  useEffect(() => {
    if (user?.id) {
      loadFavorites(user.id);
    }
  }, [user?.id, loadFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, [loadInitialData]);

  const handleCategoryPress = (category: string) => {
    navigation.navigate('Category', { category });
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleToggleFavorite = (quote: Quote) => {
    if (user?.id) {
      toggleFavorite(user.id, quote);
    }
  };

  const handleShareQuote = (quote: Quote) => {
    setQuoteToShare(quote);
    setShareModalVisible(true);
  };

  const handleAddToCollection = (quote: Quote) => {
    setSelectedQuoteForCollection(quote);
    setCollectionModalVisible(true);
  };

  // Render header with greeting, QOTD, and categories
  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{firstName}</Text>
        </View>
        <Pressable onPress={handleSearchPress} style={styles.searchButton}>
          <Ionicons name="search" size={24} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      {/* Quote of the Day */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quote of the Day</Text>
        {quoteOfDay && (
          <LinearGradient
            colors={['#E8A87C', '#D4A5A5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.qotdCard}
          >
            <View style={styles.quoteIcon}>
              <Text style={styles.quoteIconText}>"</Text>
            </View>
            <Text style={styles.qotdText}>{quoteOfDay.content}</Text>
            <Text style={styles.qotdAuthor}>— {quoteOfDay.author}</Text>
            <View style={styles.qotdActions}>
              <Pressable style={styles.qotdButton} onPress={() => handleToggleFavorite(quoteOfDay)}>
                <Ionicons
                  name={isFavorite(quoteOfDay.id) ? 'heart' : 'heart-outline'}
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>
              <Pressable
                style={styles.qotdButton}
                onPress={() => handleAddToCollection(quoteOfDay)}
              >
                <Ionicons name="folder-outline" size={20} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={styles.qotdButton}
                onPress={() => handleShareQuote(quoteOfDay)}
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </LinearGradient>
        )}
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <Pressable
              key={category}
              style={styles.categoryChip}
              onPress={() => handleCategoryPress(category)}
            >
              <Text style={styles.categoryChipText}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Discover More Title */}
      <View style={styles.discoverHeader}>
        <Text style={styles.sectionTitle}>Discover More</Text>
      </View>
    </View>
  );

  // Render each quote card
  const renderQuoteCard = ({ item, index }: { item: Quote; index: number }) => (
    <View style={[styles.discoverCard, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}>
      <View style={styles.discoverCardInner}>
        <Text style={styles.discoverQuote} numberOfLines={3}>
          "{item.content}"
        </Text>
        <Text style={styles.discoverAuthor}>— {item.author}</Text>
        <View style={styles.discoverFooter}>
          <View style={styles.discoverCategory}>
            <Text style={styles.discoverCategoryText}>{item.category}</Text>
          </View>
          <View style={styles.discoverActions}>
            <Pressable
              style={styles.discoverActionBtn}
              onPress={() => handleToggleFavorite(item)}
            >
              <Ionicons
                name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                size={16}
                color={isFavorite(item.id) ? COLORS.terracotta : COLORS.textMuted}
              />
            </Pressable>
            <Pressable
              style={styles.discoverActionBtn}
              onPress={() => handleAddToCollection(item)}
            >
              <Ionicons name="folder-outline" size={16} color={COLORS.textMuted} />
            </Pressable>
            <Pressable
              style={styles.discoverActionBtn}
              onPress={() => handleShareQuote(item)}
            >
              <Ionicons name="share-outline" size={16} color={COLORS.textMuted} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  // Render footer with loading indicator
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.terracotta} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.terracotta} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={discoverQuotes}
        keyExtractor={(item) => item.id}
        renderItem={renderQuoteCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + SPACING.base, paddingBottom: SPACING.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.terracotta}
          />
        }
        onEndReached={loadMoreQuotes}
        onEndReachedThreshold={0.5}
      />

      {/* Add to Collection Modal */}
      <AddToCollectionModal
        visible={collectionModalVisible}
        quote={selectedQuoteForCollection}
        onClose={() => setCollectionModalVisible(false)}
      />

      {/* Share Quote Modal */}
      <ShareQuoteModal
        visible={shareModalVisible}
        quote={quoteToShare}
        onClose={() => setShareModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.offWhite,
  },
  listContent: {
    paddingHorizontal: SPACING.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sansRegular,
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sansBold,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontFamily: FONTS.sansBold,
  },
  qotdCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    minHeight: 200,
  },
  quoteIcon: {
    marginBottom: SPACING.sm,
  },
  quoteIconText: {
    fontSize: 48,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: FONTS.serifBold,
    lineHeight: 48,
  },
  qotdText: {
    fontSize: FONT_SIZES.xl,
    fontStyle: 'italic',
    color: '#FFFFFF',
    fontFamily: FONTS.serifItalic,
    lineHeight: 32,
    marginBottom: SPACING.md,
  },
  qotdAuthor: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONTS.sansMedium,
    letterSpacing: 1,
  },
  qotdActions: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: SPACING.base,
    right: SPACING.base,
    gap: SPACING.sm,
  },
  qotdButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  discoverHeader: {
    marginBottom: SPACING.sm,
  },
  row: {
    justifyContent: 'space-between',
  },
  discoverCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: {
    marginRight: SPACING.xs,
  },
  cardRight: {
    marginLeft: SPACING.xs,
  },
  discoverCardInner: {
    padding: SPACING.md,
    minHeight: 170,
    justifyContent: 'space-between',
  },
  discoverQuote: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    fontFamily: FONTS.serifItalic,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  discoverAuthor: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: FONTS.sansRegular,
    marginBottom: SPACING.sm,
  },
  discoverFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discoverCategory: {
    backgroundColor: COLORS.gradientStart,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  discoverCategoryText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.terracotta,
    fontWeight: '500',
  },
  discoverActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  discoverActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

export default HomeScreen;
