/**
 * Add to Collection Modal
 *
 * Modal for adding a quote to a user's collection.
 * Shows list of collections and allows selecting one to add the quote to.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES } from '../constants/theme';
import { Quote, Collection } from '../types';
import { useAuthStore, useCollectionsStore } from '../stores';
import {
  getUserCollections,
  addQuoteToCollection,
  isQuoteInCollection,
} from '../services/collectionsService';

interface AddToCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  quote: Quote | null;
  onQuoteAdded?: () => void;
}

interface CollectionWithStatus extends Collection {
  hasQuote: boolean;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  visible,
  onClose,
  quote,
  onQuoteAdded,
}) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const incrementQuoteCount = useCollectionsStore((state) => state.incrementQuoteCount);

  const [collections, setCollections] = useState<CollectionWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  // Load collections when modal opens
  useEffect(() => {
    if (visible && user?.id && quote) {
      loadCollections();
    }
  }, [visible, user?.id, quote]);

  const loadCollections = async () => {
    if (!user?.id || !quote) return;

    setLoading(true);
    try {
      const userCollections = await getUserCollections(user.id);

      // Check which collections already have this quote
      const collectionsWithStatus = await Promise.all(
        userCollections.map(async (collection) => {
          const hasQuote = await isQuoteInCollection(collection.id, quote.id);
          return { ...collection, hasQuote };
        })
      );

      setCollections(collectionsWithStatus);
    } catch (error) {
      console.error('Error loading collections:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load collections',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async (collection: CollectionWithStatus) => {
    if (!quote || collection.hasQuote) return;

    setAdding(collection.id);
    try {
      await addQuoteToCollection(collection.id, quote.id);

      // Update local state (hasQuote and quote_count)
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collection.id
            ? { ...c, hasQuote: true, quote_count: (c.quote_count || 0) + 1 }
            : c
        )
      );

      // Update the global collections store count
      incrementQuoteCount(collection.id);

      Toast.show({
        type: 'success',
        text1: 'Added to Collection',
        text2: `Quote added to "${collection.name}"`,
      });

      onQuoteAdded?.();
    } catch (error) {
      console.error('Error adding to collection:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add quote to collection',
      });
    } finally {
      setAdding(null);
    }
  };

  const renderCollectionItem = ({ item }: { item: CollectionWithStatus }) => (
    <Pressable
      style={[
        styles.collectionItem,
        item.hasQuote && styles.collectionItemDisabled,
      ]}
      onPress={() => handleAddToCollection(item)}
      disabled={item.hasQuote || adding === item.id}
    >
      <View style={[styles.collectionIcon, { backgroundColor: item.color || COLORS.terracotta }]}>
        <Ionicons
          name={(item.icon as any) || 'folder'}
          size={20}
          color="#FFFFFF"
        />
      </View>
      <View style={styles.collectionInfo}>
        <Text style={styles.collectionName}>{item.name}</Text>
        <Text style={styles.collectionCount}>
          {item.quote_count || 0} {(item.quote_count || 0) === 1 ? 'quote' : 'quotes'}
        </Text>
      </View>
      {adding === item.id ? (
        <ActivityIndicator size="small" color={COLORS.terracotta} />
      ) : item.hasQuote ? (
        <View style={styles.checkContainer}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
        </View>
      ) : (
        <Ionicons name="add-circle-outline" size={24} color={COLORS.terracotta} />
      )}
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={48} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No collections yet</Text>
      <Text style={styles.emptySubtitle}>
        Create a collection from the Collections tab to organize your quotes
      </Text>
    </View>
  );

  if (!quote) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Add to Collection</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Quote Preview */}
          <View style={styles.quotePreview}>
            <Text style={styles.quoteText} numberOfLines={2}>
              "{quote.content}"
            </Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </View>

          {/* Collections List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.terracotta} />
            </View>
          ) : (
            <FlatList
              data={collections}
              keyExtractor={(item) => item.id}
              renderItem={renderCollectionItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyState}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  quotePreview: {
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quoteText: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    fontFamily: FONTS.serifItalic,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  loadingContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: SPACING.md,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  collectionItemDisabled: {
    opacity: 0.7,
  },
  collectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  collectionCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  checkContainer: {
    marginLeft: SPACING.sm,
  },
  emptyContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
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
    paddingHorizontal: SPACING.lg,
  },
});

export default AddToCollectionModal;
