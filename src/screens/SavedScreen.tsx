import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Share,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Pressable,
  TextInput,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { QuoteCard } from '../components/QuoteCard';
import { TagChip } from '../components/TagChip';
import { useFavoritesContext } from '../context';
import { SavedQuote } from '../types';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

export const SavedScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { favorites, loading, removeFavoriteById, getUniqueTags } = useFavoritesContext();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const searchInputRef = useRef<TextInput>(null);
  const searchBarHeight = useRef(new Animated.Value(0)).current;

  const tags = useMemo(() => {
    const uniqueTags = getUniqueTags();
    return ['All', ...uniqueTags];
  }, [getUniqueTags]);

  const formatDateForSearch = (dateString: string): string => {
    const date = new Date(dateString);
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const shortMonths = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sept', 'oct', 'nov', 'dec'
    ];
    const day = date.getDate().toString();
    const month = months[date.getMonth()];
    const shortMonth = shortMonths[date.getMonth()];
    const year = date.getFullYear().toString();
    return `${month} ${shortMonth} ${day} ${year}`;
  };

  const filteredFavorites = useMemo(() => {
    let results = favorites;

    // Apply tag filter
    if (activeFilter !== 'All') {
      results = results.filter((quote) =>
        quote.tags.some((tag) => tag.toLowerCase() === activeFilter.toLowerCase())
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter((quote) => {
        const contentMatch = quote.content.toLowerCase().includes(query);
        const authorMatch = quote.author.toLowerCase().includes(query);
        const tagMatch = quote.tags.some((tag) => tag.toLowerCase().includes(query));
        const dateMatch = formatDateForSearch(quote.savedAt).includes(query);
        return contentMatch || authorMatch || tagMatch || dateMatch;
      });
    }

    return results;
  }, [favorites, activeFilter, searchQuery]);

  const toggleSearch = () => {
    if (isSearchVisible) {
      // Hide search
      setSearchQuery('');
      Animated.timing(searchBarHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => setIsSearchVisible(false));
    } else {
      // Show search
      setIsSearchVisible(true);
      Animated.timing(searchBarHeight, {
        toValue: 50,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  const handleRemoveFavorite = async (quoteId: string) => {
    await removeFavoriteById(quoteId);
  };

  const handleShare = async (quote: SavedQuote) => {
    try {
      await Share.share({
        message: `"${quote.content}"\n\n— ${quote.author}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to share quote',
      });
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💭</Text>
      <Text style={styles.emptyTitle}>No saved quotes yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the heart icon on quotes you love to save them here
      </Text>
    </View>
  );

  const renderFilteredEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No quotes found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No quotes matching "${searchQuery}"`
          : `No quotes with the "${activeFilter}" tag`}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Saved Favorites</Text>
        <Pressable onPress={toggleSearch} style={styles.searchButton}>
          <Ionicons
            name={isSearchVisible ? 'close' : 'search'}
            size={24}
            color="#2D2D2D"
          />
        </Pressable>
      </View>

      {/* Search Bar */}
      <Animated.View style={[styles.searchBarContainer, { height: searchBarHeight }]}>
        {isSearchVisible && (
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color="#9B8579" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search by quote, author, tag, or date..."
              placeholderTextColor="#9B8579"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#9B8579" />
              </Pressable>
            )}
          </View>
        )}
      </Animated.View>

      {/* Tag Filters */}
      {favorites.length > 0 && (
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {tags.map((tag) => (
              <TagChip
                key={tag}
                label={tag}
                variant="filter"
                isActive={activeFilter === tag}
                onPress={() => setActiveFilter(tag)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quote List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C4785A" />
        </View>
      ) : favorites.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyScrollContainer}>
          {renderEmptyState()}
        </ScrollView>
      ) : filteredFavorites.length === 0 ? (
        renderFilteredEmptyState()
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <QuoteCard
              quote={item}
              onRemoveFavorite={handleRemoveFavorite}
              onShare={handleShare}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: height * 0.02,
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: '600',
    color: '#2D2D2D',
    letterSpacing: 0.5,
  },
  searchButton: {
    padding: 4,
  },
  searchBarContainer: {
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#F0EBE3',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D2D2D',
  },
  clearButton: {
    padding: 4,
  },
  filtersWrapper: {
    marginBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyScrollContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  emptyIcon: {
    fontSize: Math.min(64, width * 0.16),
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: Math.min(22, width * 0.055),
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: Math.min(15, width * 0.038),
    color: '#8B8B8B',
    textAlign: 'center',
    lineHeight: 24,
  },
});
