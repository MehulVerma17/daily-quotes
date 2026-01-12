/**
 * Collections Screen
 *
 * Displays user's quote collections in a grid layout.
 * Matches design from image 8.
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
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, scale } from '../../constants/theme';
import { Collection } from '../../types';
import { getUserCollections, createCollection, deleteCollection } from '../../services/collectionsService';

const { width } = Dimensions.get('window');

type CollectionsStackParamList = {
  Collections: undefined;
  CollectionDetail: { collectionId: string; collectionName: string };
};

// Collection color presets
const COLLECTION_COLORS = [
  '#C4785A', // Terracotta
  '#D4A5A5', // Dusty Rose
  '#A8B5C4', // Muted Sage
  '#C4A85A', // Amber
  '#8E5AC4', // Purple
  '#5AC478', // Forest
];

// Collection icon presets
const COLLECTION_ICONS = [
  'sunny',
  'moon',
  'heart',
  'star',
  'leaf',
  'book',
  'bulb',
  'trophy',
];

export const CollectionsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<CollectionsStackParamList>>();
  const { user } = useAuth();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLLECTION_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(COLLECTION_ICONS[0]);
  const [creating, setCreating] = useState(false);

  const loadCollections = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getUserCollections(user.id);
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  }, [loadCollections]);

  const handleCreateCollection = async () => {
    if (!user?.id || !newCollectionName.trim()) return;

    setCreating(true);
    try {
      const newCollection = await createCollection(
        user.id,
        newCollectionName.trim(),
        undefined,
        selectedIcon,
        selectedColor
      );
      if (newCollection) {
        setCollections((prev) => [{ ...newCollection, quote_count: 0 }, ...prev]);
      }
      setShowCreateModal(false);
      setNewCollectionName('');
      setSelectedColor(COLLECTION_COLORS[0]);
      setSelectedIcon(COLLECTION_ICONS[0]);
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await deleteCollection(collectionId);
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const handleCollectionPress = (collection: Collection) => {
    navigation.navigate('CollectionDetail', {
      collectionId: collection.id,
      collectionName: collection.name,
    });
  };

  const renderCollectionCard = ({ item }: { item: Collection }) => (
    <Pressable
      style={styles.collectionCard}
      onPress={() => handleCollectionPress(item)}
    >
      <View style={[styles.collectionColorBar, { backgroundColor: item.color }]} />
      <View style={styles.collectionContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons
            name={item.icon as any}
            size={24}
            color={item.color}
          />
        </View>
        <Text style={styles.collectionName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.quoteCount}>
          {item.quote_count || 0} {item.quote_count === 1 ? 'quote' : 'quotes'}
        </Text>
      </View>
    </Pressable>
  );

  const renderCreateButton = () => (
    <Pressable
      style={styles.createCard}
      onPress={() => setShowCreateModal(true)}
    >
      <View style={styles.createIconContainer}>
        <Ionicons name="add" size={32} color={COLORS.terracotta} />
      </View>
      <Text style={styles.createText}>New Collection</Text>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="folder-outline" size={48} color={COLORS.terracotta} />
      </View>
      <Text style={styles.emptyTitle}>No collections yet</Text>
      <Text style={styles.emptySubtitle}>
        Create collections to organize your favorite quotes
      </Text>
      <Pressable
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={20} color={COLORS.white} />
        <Text style={styles.createButtonText}>Create Collection</Text>
      </Pressable>
    </View>
  );

  if (loading) {
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Collections</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.terracotta} />
        </Pressable>
      </View>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={renderCollectionCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.terracotta}
            />
          }
          ListFooterComponent={renderCreateButton}
        />
      )}

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + SPACING.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Collection</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </Pressable>
            </View>

            {/* Collection Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter collection name"
                placeholderTextColor={COLORS.textPlaceholder}
                value={newCollectionName}
                onChangeText={setNewCollectionName}
                autoFocus
              />
            </View>

            {/* Icon Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Icon</Text>
              <View style={styles.iconGrid}>
                {COLLECTION_ICONS.map((icon) => (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.iconOptionSelected,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons
                      name={icon as any}
                      size={24}
                      color={selectedIcon === icon ? COLORS.white : COLORS.textPrimary}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Color Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {COLLECTION_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={16} color={COLORS.white} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Create Button */}
            <Pressable
              style={[
                styles.createCollectionButton,
                (!newCollectionName.trim() || creating) && styles.createCollectionButtonDisabled,
              ]}
              onPress={handleCreateCollection}
              disabled={!newCollectionName.trim() || creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.createCollectionButtonText}>Create Collection</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const cardWidth = (width - SPACING.base * 2 - SPACING.md) / 2;

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sansBold,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xxl,
  },
  row: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  collectionCard: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  collectionColorBar: {
    height: 6,
  },
  collectionContent: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  collectionName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  quoteCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  createCard: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
  },
  createIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gradientStart,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  createText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.terracotta,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: SPACING.xl,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.terracotta,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  createButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconOptionSelected: {
    backgroundColor: COLORS.terracotta,
    borderColor: COLORS.terracotta,
  },
  colorGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createCollectionButton: {
    backgroundColor: COLORS.terracotta,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  createCollectionButtonDisabled: {
    opacity: 0.5,
  },
  createCollectionButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CollectionsScreen;
