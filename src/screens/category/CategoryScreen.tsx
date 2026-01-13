/**
 * Category Screen
 *
 * Displays quotes filtered by category with masonry grid layout.
 * Matches design from image 6.
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
  Share,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, GRADIENTS, scale } from '../../constants/theme';
import { Quote } from '../../types';
import { getQuotesByCategory } from '../../services/quoteService';
import { useAuthStore, useFavoritesStore } from '../../stores';
import { AddToCollectionModal } from '../../components';

const { width } = Dimensions.get('window');

type CategoryStackParamList = {
  Category: { category: string };
};

// Category gradient colors
const CATEGORY_GRADIENTS: Record<string, readonly [string, string]> = {
  Motivation: ['#E8A87C', '#D4927A'],
  Love: ['#D4A5A5', '#E8B5B5'],
  Success: ['#C4A85A', '#D4B87A'],
  Wisdom: ['#A8B5C4', '#B8C5D4'],
  Humor: ['#E8D87C', '#F0E0A0'],
};

export const CategoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<CategoryStackParamList>>();
  const route = useRoute<RouteProp<CategoryStackParamList, 'Category'>>();

  // Zustand stores
  const user = useAuthStore((state) => state.user);
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const { category } = route.params;

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Collection modal state
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [selectedQuoteForCollection, setSelectedQuoteForCollection] = useState<Quote | null>(null);

  const gradientColors: readonly [string, string] = CATEGORY_GRADIENTS[category] || ['#E8A87C', '#D4927A'];

  const loadQuotes = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      const response = await getQuotesByCategory(category, pageNum);
      if (refresh || pageNum === 1) {
        setQuotes(response.data);
      } else {
        setQuotes((prev) => [...prev, ...response.data]);
      }
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading category quotes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadQuotes(1, true);
  }, [loadQuotes]);

  const onLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadQuotes(page + 1);
    }
  }, [loading, hasMore, page, loadQuotes]);

  const handleToggleFavorite = (quote: Quote) => {
    if (user?.id) {
      toggleFavorite(user.id, quote);
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

  const renderQuoteCard = ({ item, index }: { item: Quote; index: number }) => {
    // Alternating card sizes for masonry effect
    const isLarge = index % 3 === 0;
    return (
      <View style={[styles.quoteCard, isLarge && styles.quoteCardLarge]}>
        <Text style={[styles.quoteText, isLarge && styles.quoteTextLarge]} numberOfLines={isLarge ? 6 : 4}>
          "{item.content}"
        </Text>
        <View style={styles.quoteFooter}>
          <Text style={styles.quoteAuthor}>— {item.author}</Text>
          <View style={styles.quoteActions}>
            <Pressable style={styles.actionButton} onPress={() => handleToggleFavorite(item)}>
              <Ionicons
                name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                size={16}
                color={isFavorite(item.id) ? COLORS.terracotta : COLORS.textMuted}
              />
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => handleAddToCollection(item)}>
              <Ionicons name="folder-outline" size={16} color={COLORS.textMuted} />
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => handleShareQuote(item)}>
              <Ionicons name="share-outline" size={16} color={COLORS.textMuted} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.headerGradient, { paddingTop: insets.top }]}
    >
      <View style={styles.headerContent}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerCategory}>{category}</Text>
          <Text style={styles.headerQuoteCount}>
            {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  if (loading && quotes.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.terracotta} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={quotes}
        keyExtractor={(item) => item.id}
        renderItem={renderQuoteCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && quotes.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={COLORS.terracotta} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No quotes yet</Text>
            <Text style={styles.emptySubtitle}>
              Quotes in this category will appear here
            </Text>
          </View>
        }
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

const cardWidth = (width - SPACING.base * 2 - SPACING.md) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  headerGradient: {
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
  },
  headerContent: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTextContainer: {
    paddingBottom: SPACING.base,
  },
  headerCategory: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    marginBottom: SPACING.xs,
  },
  headerQuoteCount: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONTS.sansRegular,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  row: {
    paddingHorizontal: SPACING.base,
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  quoteCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    minHeight: 140,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteCardLarge: {
    minHeight: 180,
  },
  quoteText: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    fontFamily: FONTS.serifItalic,
    lineHeight: 20,
    flex: 1,
  },
  quoteTextLarge: {
    fontSize: FONT_SIZES.base,
    lineHeight: 22,
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: FONTS.sansRegular,
    flex: 1,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default CategoryScreen;
