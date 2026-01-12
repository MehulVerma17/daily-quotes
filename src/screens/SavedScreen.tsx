import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Share,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  const tags = useMemo(() => {
    const uniqueTags = getUniqueTags();
    return ['All', ...uniqueTags];
  }, [getUniqueTags]);

  const filteredFavorites = useMemo(() => {
    if (activeFilter === 'All') {
      return favorites;
    }
    return favorites.filter((quote) =>
      quote.tags.some((tag) => tag.toLowerCase() === activeFilter.toLowerCase())
    );
  }, [favorites, activeFilter]);

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
        No quotes with the "{activeFilter}" tag
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Favorites</Text>
      </View>

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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: height * 0.02,
  },
  headerTitle: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: '600',
    color: '#2D2D2D',
    letterSpacing: 0.5,
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
