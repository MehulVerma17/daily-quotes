/**
 * Search Screen
 *
 * Search quotes by content, author, or category.
 * Matches design from image 5.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, scale } from '../../constants/theme';
import { Quote } from '../../types';
import { searchQuotes, getQuotesByAuthor } from '../../services/quoteService';
import { useAuthStore, useFavoritesStore } from '../../stores';
import { CATEGORIES } from '../../config';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'author' | 'category';

type SearchStackParamList = {
  Search: undefined;
  Category: { category: string };
};

export const SearchScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<SearchStackParamList>>();

  // Zustand stores
  const user = useAuthStore((state) => state.user);
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const searchInputRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [results, setResults] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search effect
  useEffect(() => {
    // Don't search when category filter is active (shows category list instead)
    if (activeFilter === 'category') {
      return;
    }

    // Clear results if search query is empty
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    // Set up debounce timer
    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);

      try {
        let response;
        if (activeFilter === 'author') {
          response = await getQuotesByAuthor(searchQuery);
        } else {
          response = await searchQuotes(searchQuery);
        }
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    // Cleanup: clear timer on re-render
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeFilter]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleCategorySelect = (category: string) => {
    navigation.navigate('Category', { category });
  };

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

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
    searchInputRef.current?.focus();
  };

  const renderQuoteItem = ({ item }: { item: Quote }) => (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteText} numberOfLines={4}>
        "{item.content}"
      </Text>
      <View style={styles.quoteFooter}>
        <View>
          <Text style={styles.quoteAuthor}>— {item.author}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>
        <View style={styles.quoteActions}>
          <Pressable style={styles.actionButton} onPress={() => handleToggleFavorite(item)}>
            <Ionicons
              name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite(item.id) ? COLORS.terracotta : COLORS.textMuted}
            />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => handleShareQuote(item)}>
            <Ionicons name="share-outline" size={18} color={COLORS.textMuted} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: string }) => (
    <Pressable
      style={styles.categoryCard}
      onPress={() => handleCategorySelect(item)}
    >
      <Text style={styles.categoryCardText}>{item}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.terracotta} />
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>
        {hasSearched ? 'No results found' : 'Search for quotes'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {hasSearched
          ? `Try searching for something else`
          : 'Find quotes by keywords or authors'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search quotes, authors..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <Pressable
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => handleFilterChange('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'all' && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterChip, activeFilter === 'author' && styles.filterChipActive]}
          onPress={() => handleFilterChange('author')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'author' && styles.filterChipTextActive,
            ]}
          >
            By Author
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterChip, activeFilter === 'category' && styles.filterChipActive]}
          onPress={() => handleFilterChange('category')}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'category' && styles.filterChipTextActive,
            ]}
          >
            By Category
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.terracotta} />
        </View>
      ) : activeFilter === 'category' ? (
        <FlatList
          data={CATEGORIES as unknown as string[]}
          keyExtractor={(item) => item}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderQuoteItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sansBold,
  },
  searchContainer: {
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.sansRegular,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
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
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xxl,
  },
  quoteCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    alignItems: 'flex-end',
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sansMedium,
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: COLORS.gradientStart,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.terracotta,
    fontWeight: '500',
  },
  quoteActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryCardText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default SearchScreen;
