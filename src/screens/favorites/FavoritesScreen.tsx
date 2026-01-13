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
import { SPACING, RADIUS, FONTS, FONT_SIZES, scale } from '../../constants/theme';
import { useTheme } from '../../contexts';
import { Quote, UserFavorite } from '../../types';
import {
  getFavoriteCategories,
  getFavoriteAuthors,
} from '../../services/favoritesService';
import { AddToCollectionModal } from '../../components';

const { width } = Dimensions.get('window');

export const FavoritesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors, accent } = useTheme();

  // Zustand stores
  const user = useAuthStore((state) => state.user);
  const { favorites, loading: favoritesLoading, toggleFavorite, loadFavorites } = useFavoritesStore();

  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Collection modal state
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [selectedQuoteForCollection, setSelectedQuoteForCollection] = useState<Quote | null>(null);

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

  const handleAddToCollection = (quote: Quote) => {
    setSelectedQuoteForCollection(quote);
    setCollectionModalVisible(true);
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Saved Favorites</Text>
        <View style={styles.syncBadge}>
          <Ionicons name="cloud-done" size={14} color={colors.success} />
          <Text style={[styles.syncText, { color: colors.success }]}>SYNCED</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.statNumber, { color: accent.primary }]}>{favorites.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Favorites</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.statNumber, { color: accent.primary }]}>{categories.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Categories</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.statNumber, { color: accent.primary }]}>{authors.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Authors</Text>
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
              { backgroundColor: colors.white, borderColor: colors.border },
              activeFilter === filter && { backgroundColor: accent.primary, borderColor: accent.primary },
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: colors.textPrimary },
                activeFilter === filter && { color: '#FFFFFF' },
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
      <View style={[styles.quoteCard, { backgroundColor: colors.white }]}>
        <View style={styles.quoteCardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.gradientStart }]}>
            <Text style={[styles.categoryBadgeText, { color: accent.primary }]}>{quote.category}</Text>
          </View>
          <Pressable
            style={[styles.favoriteButton, { backgroundColor: colors.offWhite }]}
            onPress={() => handleRemoveFavorite(quote)}
          >
            <Ionicons name="heart" size={20} color={accent.primary} />
          </Pressable>
        </View>
        <Text style={[styles.quoteText, { color: colors.textPrimary }]} numberOfLines={4}>
          "{quote.content}"
        </Text>
        <View style={styles.quoteFooter}>
          <Text style={[styles.quoteAuthor, { color: colors.textSecondary }]}>— {quote.author}</Text>
          <View style={styles.quoteActions}>
            <Pressable
              style={[styles.shareButton, { backgroundColor: colors.offWhite }]}
              onPress={() => handleAddToCollection(quote)}
            >
              <Ionicons name="folder-outline" size={18} color={colors.textMuted} />
            </Pressable>
            <Pressable
              style={[styles.shareButton, { backgroundColor: colors.offWhite }]}
              onPress={() => handleShareQuote(quote)}
            >
              <Ionicons name="share-outline" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.gradientStart }]}>
        <Ionicons name="heart-outline" size={48} color={accent.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No favorites yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
        Tap the heart icon on quotes you love to save them here
      </Text>
    </View>
  );

  if (loading || favoritesLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.offWhite }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.offWhite }]}>
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
            tintColor={accent.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Add to Collection Modal */}
      <AddToCollectionModal
        visible={collectionModalVisible}
        quote={selectedQuoteForCollection}
        onClose={() => setCollectionModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    fontFamily: FONTS.sansBold,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  filtersContainer: {
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  quoteCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    shadowColor: '#000',
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
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  categoryBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteText: {
    fontSize: FONT_SIZES.base,
    fontStyle: 'italic',
    fontFamily: FONTS.serifItalic,
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quoteActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.sansMedium,
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FavoritesScreen;
