/**
 * Favorites Screen
 *
 * Displays user's saved favorite quotes with stats and category filters.
 * Matches design from image 7.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  Share,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useFavoritesStore } from '../../stores';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, scale } from '../../constants/theme';
import { Quote, UserFavorite } from '../../types';
import {
  getFavoriteCategories,
  getFavoriteAuthors,
} from '../../services/favoritesService';

const { width } = Dimensions.get('window');

export const FavoritesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Zustand stores
  const user = useAuthStore((state) => state.user);
  const { favorites, loading: favoritesLoading, toggleFavorite, loadFavorites } = useFavoritesStore();

  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const loadMetadata = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [cats, auths] = await Promise.all([
        getFavoriteCategories(user.id),
        getFavoriteAuthors(user.id),
      ]);
      setCategories(cats);
      setAuthors(auths);
    } catch (error) {
      console.error('Error loading favorites metadata:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata, favorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.id) {
      await loadFavorites(user.id);
    }
    await loadMetadata();
    setRefreshing(false);
  }, [user?.id, loadFavorites, loadMetadata]);

  const handleRemoveFavorite = async (quote: Quote) => {
    if (user?.id) {
      await toggleFavorite(user.id, quote);
    }
  };

  const handleShareQuote = async (quote: Quote) => {
    try {
      await Share.share({
        message: `"${quote.content}"\n\n— ${quote.author}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Filter favorites by category
  const filteredFavorites = useMemo(() => {
    if (activeFilter === 'All') return favorites;
    return favorites.filter((f) => f.quote?.category === activeFilter);
  }, [favorites, activeFilter]);

  const filters = useMemo(() => ['All', ...categories], [categories]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.headerTitle}>Saved Favorites</Text>
        <View style={styles.syncBadge}>
          <Ionicons name="cloud-done" size={14} color={COLORS.success} />
          <Text style={styles.syncText}>SYNCED</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{authors.length}</Text>
          <Text style={styles.statLabel}>Authors</Text>
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <Pressable
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === filter && styles.filterChipTextActive,
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuoteCard = ({ item }: { item: UserFavorite }) => {
    const quote = item.quote;
    if (!quote) return null;

    return (
      <View style={styles.quoteCard}>
        <View style={styles.quoteCardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{quote.category}</Text>
          </View>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavorite(quote)}
          >
            <Ionicons name="heart" size={20} color={COLORS.terracotta} />
          </Pressable>
        </View>
        <Text style={styles.quoteText} numberOfLines={4}>
          "{quote.content}"
        </Text>
        <View style={styles.quoteFooter}>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          <Pressable
            style={styles.shareButton}
            onPress={() => handleShareQuote(quote)}
          >
            <Ionicons name="share-outline" size={18} color={COLORS.textMuted} />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={48} color={COLORS.terracotta} />
      </View>
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the heart icon on quotes you love to save them here
      </Text>
    </View>
  );

  if (loading || favoritesLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.terracotta} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        renderItem={renderQuoteCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.terracotta}
          />
        }
        ListEmptyComponent={renderEmptyState}
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
  },
  headerContainer: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sansBold,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  syncText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.terracotta,
    fontFamily: FONTS.sansBold,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  filtersContainer: {
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.terracotta,
    borderColor: COLORS.terracotta,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  quoteCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  categoryBadge: {
    backgroundColor: COLORS.gradientStart,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.terracotta,
    fontWeight: '500',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: FONT_SIZES.base,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    fontFamily: FONTS.serifItalic,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sansMedium,
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gradientStart,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FavoritesScreen;
