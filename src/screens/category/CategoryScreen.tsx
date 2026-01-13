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
import { SPACING, RADIUS, FONTS, FONT_SIZES, GRADIENTS, scale } from '../../constants/theme';
import { Quote } from '../../types';
import { getQuotesByCategory } from '../../services/quoteService';
import { useAuthStore, useFavoritesStore } from '../../stores';
import { useTheme } from '../../contexts';
import { AddToCollectionModal } from '../../components';

const { width } = Dimensions.get('window');

type CategoryStackParamList = {
  Category: { category: string };
};

export const CategoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<CategoryStackParamList>>();
  const route = useRoute<RouteProp<CategoryStackParamList, 'Category'>>();

  // Theme
  const { colors, accent, gradients } = useTheme();

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

  // Get gradient from theme based on category name
  const categoryKey = category.toLowerCase() as keyof typeof gradients;
  const gradientColors: readonly [string, string] =
    (gradients[categoryKey] as readonly [string, string]) || gradients.motivation;

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
      <View style={[styles.quoteCard, { backgroundColor: colors.white, shadowColor: colors.shadow }, isLarge && styles.quoteCardLarge]}>
        <Text style={[styles.quoteText, { color: colors.textPrimary }, isLarge && styles.quoteTextLarge]} numberOfLines={isLarge ? 6 : 4}>
          "{item.content}"
        </Text>
        <View style={styles.quoteFooter}>
          <Text style={[styles.quoteAuthor, { color: colors.textMuted }]}>— {item.author}</Text>
          <View style={styles.quoteActions}>
            <Pressable style={[styles.actionButton, { backgroundColor: colors.offWhite }]} onPress={() => handleToggleFavorite(item)}>
              <Ionicons
                name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                size={16}
                color={isFavorite(item.id) ? accent.primary : colors.textMuted}
              />
            </Pressable>
            <Pressable style={[styles.actionButton, { backgroundColor: colors.offWhite }]} onPress={() => handleAddToCollection(item)}>
              <Ionicons name="folder-outline" size={16} color={colors.textMuted} />
            </Pressable>
            <Pressable style={[styles.actionButton, { backgroundColor: colors.offWhite }]} onPress={() => handleShareQuote(item)}>
              <Ionicons name="share-outline" size={16} color={colors.textMuted} />
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
          <Ionicons name="arrow-back" size={24} color={colors.white} />
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
      <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.offWhite }]}>
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
            tintColor={accent.primary}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && quotes.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={accent.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No quotes yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
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
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    minHeight: 140,
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
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
});

export default CategoryScreen;
