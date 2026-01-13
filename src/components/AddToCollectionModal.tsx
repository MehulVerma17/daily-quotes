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
import { SPACING, RADIUS, FONTS, FONT_SIZES } from '../constants/theme';
import { useTheme } from '../contexts';
import { Quote, Collection } from '../types';
import { useAuthStore, useCollectionsStore } from '../stores';
import {
  getUserCollections,
  addQuoteToCollection,
  isQuoteInCollection,
} from '../services/collectionsService';
import { STRINGS } from '../constants/strings';

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

  // Theme
  const { colors, accent } = useTheme();

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
        text1: STRINGS.COMMON.ERROR,
        text2: STRINGS.COLLECTIONS.LOAD_FAILED,
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
        text1: STRINGS.COLLECTIONS.ADDED_SUCCESS,
        text2: STRINGS.COLLECTIONS.ADDED_SUCCESS_DESC(collection.name),
      });

      onQuoteAdded?.();
    } catch (error) {
      console.error('Error adding to collection:', error);
      Toast.show({
        type: 'error',
        text1: STRINGS.COMMON.ERROR,
        text2: STRINGS.COLLECTIONS.ADD_FAILED,
      });
    } finally {
      setAdding(null);
    }
  };

  const renderCollectionItem = ({ item }: { item: CollectionWithStatus }) => (
    <Pressable
      style={[
        styles.collectionItem,
        { backgroundColor: colors.white, borderColor: colors.border },
        item.hasQuote && styles.collectionItemDisabled,
      ]}
      onPress={() => handleAddToCollection(item)}
      disabled={item.hasQuote || adding === item.id}
    >
      <View style={[styles.collectionIcon, { backgroundColor: item.color || accent.primary }]}>
        <Ionicons
          name={(item.icon as any) || 'folder'}
          size={20}
          color={colors.white}
        />
      </View>
      <View style={styles.collectionInfo}>
        <Text style={[styles.collectionName, { color: colors.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.collectionCount, { color: colors.textMuted }]}>
          {STRINGS.quoteCount(item.quote_count || 0)}
        </Text>
      </View>
      {adding === item.id ? (
        <ActivityIndicator size="small" color={accent.primary} />
      ) : item.hasQuote ? (
        <View style={styles.checkContainer}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        </View>
      ) : (
        <Ionicons name="add-circle-outline" size={24} color={accent.primary} />
      )}
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{STRINGS.COLLECTIONS.EMPTY_TITLE}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
        {STRINGS.COLLECTIONS.EMPTY_DESC}
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
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.container, { paddingBottom: insets.bottom + SPACING.lg, backgroundColor: colors.white }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{STRINGS.MODALS.ADD_TO_COLLECTION}</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Quote Preview */}
          <View style={[styles.quotePreview, { backgroundColor: colors.offWhite }]}>
            <Text style={[styles.quoteText, { color: colors.textPrimary }]} numberOfLines={2}>
              "{quote.content}"
            </Text>
            <Text style={[styles.quoteAuthor, { color: colors.textMuted }]}>— {quote.author}</Text>
          </View>

          {/* Collections List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={accent.primary} />
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
    justifyContent: 'flex-end',
  },
  container: {
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
  },
  headerSpacer: {
    width: 40,
  },
  quotePreview: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  quoteText: {
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    fontFamily: FONTS.serifItalic,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  quoteAuthor: {
    fontSize: FONT_SIZES.xs,
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
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
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
    marginBottom: 2,
  },
  collectionCount: {
    fontSize: FONT_SIZES.xs,
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
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});

export default AddToCollectionModal;
