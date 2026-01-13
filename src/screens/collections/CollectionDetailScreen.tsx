/**
 * Collection Detail Screen
 *
 * Displays quotes within a specific collection.
 * Matches design from image 9.
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
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, scale } from '../../constants/theme';
import { Quote, CollectionWithQuotes } from '../../types';
import { getCollectionWithQuotes, removeQuoteFromCollection, deleteCollection } from '../../services/collectionsService';
import { useCollectionsStore } from '../../stores';

const { width } = Dimensions.get('window');

type CollectionDetailParamList = {
  CollectionDetail: { collectionId: string; collectionName: string };
};

export const CollectionDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<CollectionDetailParamList, 'CollectionDetail'>>();
  const { collectionId, collectionName } = route.params;

  // Zustand store
  const {
    decrementQuoteCount,
    deleteCollection: deleteCollectionFromStore,
  } = useCollectionsStore();

  const [collection, setCollection] = useState<CollectionWithQuotes | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCollection = useCallback(async () => {
    try {
      const data = await getCollectionWithQuotes(collectionId);
      setCollection(data);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCollection();
    setRefreshing(false);
  }, [loadCollection]);

  const handleRemoveQuote = async (quoteId: string) => {
    Alert.alert(
      'Remove Quote',
      'Are you sure you want to remove this quote from the collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeQuoteFromCollection(collectionId, quoteId);
              setCollection((prev) =>
                prev
                  ? { ...prev, quotes: prev.quotes.filter((q) => q.id !== quoteId) }
                  : null
              );
              // Update the global collections store count
              decrementQuoteCount(collectionId);
            } catch (error) {
              console.error('Error removing quote:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteCollection = () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCollection(collectionId);
              // Update the global collections store
              deleteCollectionFromStore(collectionId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting collection:', error);
            }
          },
        },
      ]
    );
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

  const renderQuoteCard = ({ item }: { item: Quote }) => (
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
          <Pressable style={styles.actionButton} onPress={() => handleShareQuote(item)}>
            <Ionicons name="share-outline" size={18} color={COLORS.textMuted} />
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => handleRemoveQuote(item.id)}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={[collection?.color || COLORS.terracotta, (collection?.color || COLORS.terracotta) + 'CC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.headerGradient, { paddingTop: insets.top }]}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTopRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={handleDeleteCollection} style={styles.moreButton}>
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.headerTextContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={(collection?.icon as any) || 'folder'}
              size={32}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.headerTitle}>{collectionName}</Text>
          <Text style={styles.headerQuoteCount}>
            {collection?.quotes.length || 0} {(collection?.quotes.length || 0) === 1 ? 'quote' : 'quotes'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No quotes yet</Text>
      <Text style={styles.emptySubtitle}>
        Add quotes to this collection from your favorites or browse
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.terracotta, COLORS.terracottaLight]}
          style={[styles.headerGradient, { paddingTop: insets.top }]}
        >
          <View style={styles.headerContent}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.terracotta} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={collection?.quotes || []}
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
  headerGradient: {
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
  },
  headerContent: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
    paddingBottom: SPACING.base,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: FONTS.sansBold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  headerQuoteCount: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONTS.sansRegular,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  quoteCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.md,
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
    lineHeight: 22,
  },
});

export default CollectionDetailScreen;
