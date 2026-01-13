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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore, useCollectionsStore } from '../../stores';
import { SPACING, RADIUS, FONTS, FONT_SIZES, scale } from '../../constants/theme';
import { useTheme } from '../../contexts';
import { Collection } from '../../types';
import { createCollection, deleteCollection } from '../../services/collectionsService';

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

  // Theme
  const { colors, accent } = useTheme();

  // Zustand stores
  const user = useAuthStore((state) => state.user);
  const {
    collections,
    loading,
    loadCollections,
    addCollection: addCollectionToStore,
    deleteCollection: deleteCollectionFromStore,
  } = useCollectionsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLLECTION_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(COLLECTION_ICONS[0]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadCollections(user.id);
    }
  }, [user?.id, loadCollections]);

  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await loadCollections(user.id);
    setRefreshing(false);
  }, [user?.id, loadCollections]);

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
        addCollectionToStore({ ...newCollection, quote_count: 0 });
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

  const handleDeleteCollectionPress = async (collectionId: string) => {
    try {
      await deleteCollection(collectionId);
      deleteCollectionFromStore(collectionId);
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
      style={[styles.collectionCard, { backgroundColor: colors.white, shadowColor: colors.shadow }]}
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
        <Text style={[styles.collectionName, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.quoteCount, { color: colors.textMuted }]}>
          {item.quote_count || 0} {item.quote_count === 1 ? 'quote' : 'quotes'}
        </Text>
      </View>
    </Pressable>
  );

  const renderCreateButton = () => (
    <Pressable
      style={[styles.createCard, { backgroundColor: colors.white, borderColor: colors.border }]}
      onPress={() => setShowCreateModal(true)}
    >
      <View style={[styles.createIconContainer, { backgroundColor: colors.gradientStart }]}>
        <Ionicons name="add" size={32} color={accent.primary} />
      </View>
      <Text style={[styles.createText, { color: accent.primary }]}>New Collection</Text>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.gradientStart }]}>
        <Ionicons name="folder-outline" size={48} color={accent.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No collections yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
        Create collections to organize your favorite quotes
      </Text>
      <Pressable
        style={[styles.createButton, { backgroundColor: accent.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={[styles.createButtonText, { color: colors.white }]}>Create Collection</Text>
      </Pressable>
    </View>
  );

  if (loading) {
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Collections</Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.white, shadowColor: colors.shadow }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={accent.primary} />
        </Pressable>
      </View>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={accent.primary}
            />
          }
        >
          {renderEmptyState()}
        </ScrollView>
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
              tintColor={accent.primary}
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
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.white, paddingBottom: insets.bottom + SPACING.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>New Collection</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            {/* Collection Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.offWhite, borderColor: colors.border, color: colors.textPrimary }]}
                placeholder="Enter collection name"
                placeholderTextColor={colors.textPlaceholder}
                value={newCollectionName}
                onChangeText={setNewCollectionName}
                autoFocus
              />
            </View>

            {/* Icon Selection */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Icon</Text>
              <View style={styles.iconGrid}>
                {COLLECTION_ICONS.map((icon) => (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconOption,
                      { backgroundColor: colors.offWhite, borderColor: colors.border },
                      selectedIcon === icon && { backgroundColor: accent.primary, borderColor: accent.primary },
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons
                      name={icon as any}
                      size={24}
                      color={selectedIcon === icon ? colors.white : colors.textPrimary}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Color Selection */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Color</Text>
              <View style={styles.colorGrid}>
                {COLLECTION_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && [styles.colorOptionSelected, { borderColor: colors.white }],
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Create Button */}
            <Pressable
              style={[
                styles.createCollectionButton,
                { backgroundColor: accent.primary },
                (!newCollectionName.trim() || creating) && styles.createCollectionButtonDisabled,
              ]}
              onPress={handleCreateCollection}
              disabled={!newCollectionName.trim() || creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={[styles.createCollectionButtonText, { color: colors.white }]}>Create Collection</Text>
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
    fontFamily: FONTS.sansBold,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
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
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  quoteCount: {
    fontSize: FONT_SIZES.xs,
  },
  createCard: {
    width: cardWidth,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  createIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  createText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  emptyScrollContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xxxl,
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
    marginBottom: SPACING.xl,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  createButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  input: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createCollectionButton: {
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
  },
});

export default CollectionsScreen;
