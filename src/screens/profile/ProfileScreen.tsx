/**
 * Profile Screen
 *
 * Displays user profile with stats, achievements, and settings menu.
 * Matches design from image 10.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES, scale } from '../../constants/theme';
import { getFavoriteCount } from '../../services/favoritesService';
import { getCollectionCount } from '../../services/collectionsService';

const { width } = Dimensions.get('window');

type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
};

// Achievement badges
const ACHIEVEMENTS = [
  { id: 'collector', icon: 'trophy', name: 'Quote Collector', level: 'Level 5', color: '#C4785A' },
  { id: 'curator', icon: 'diamond', name: 'Curator', level: 'Expert', color: '#D4A5A5' },
  { id: 'reader', icon: 'calendar', name: 'Daily Reader', level: '10+ Days', color: '#E8A87C' },
];

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  // Zustand store
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  const [favoriteCount, setFavoriteCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [sharedCount, setSharedCount] = useState(23); // Placeholder
  const [dayStreak, setDayStreak] = useState(89); // Placeholder

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [favs, cols] = await Promise.all([
        getFavoriteCount(user.id),
        getCollectionCount(user.id),
      ]);
      setFavoriteCount(favs);
      setCollectionCount(cols);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            console.log('Delete account');
          },
        },
      ]
    );
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable style={styles.editButton}>
            <Ionicons name="pencil" size={20} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={40} color={COLORS.textMuted} />
              )}
            </View>
            <Pressable style={styles.cameraButton}>
              <Ionicons name="camera" size={14} color={COLORS.white} />
            </Pressable>
          </View>
          <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.memberSince}>Member since {memberSince}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FCE4EC' }]}>
              <Ionicons name="heart" size={18} color={COLORS.terracotta} />
            </View>
            <Text style={styles.statNumber}>{favoriteCount}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="folder" size={18} color={COLORS.success} />
            </View>
            <Text style={styles.statNumber}>{collectionCount}</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="share-social" size={18} color={COLORS.info} />
            </View>
            <Text style={styles.statNumber}>{sharedCount}</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="flame" size={18} color={COLORS.warning} />
            </View>
            <Text style={styles.statNumber}>{dayStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsRow}>
            {ACHIEVEMENTS.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
                  <Ionicons name={achievement.icon as any} size={24} color={achievement.color} />
                </View>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementLevel}>{achievement.level}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={22} color={COLORS.textPrimary} />
              <Text style={styles.menuItemText}>Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="options-outline" size={22} color={COLORS.textPrimary} />
              <Text style={styles.menuItemText}>Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color={COLORS.textPrimary} />
              <Text style={styles.menuItemText}>Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <Pressable style={styles.dangerItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.terracotta} />
            <Text style={styles.dangerText}>Log Out</Text>
          </Pressable>

          <Pressable style={styles.dangerItem} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
            <Text style={[styles.dangerText, { color: COLORS.error }]}>Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sansBold,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.gradientStart,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sansBold,
    marginBottom: SPACING.xs,
  },
  memberSince: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.base,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: (width - SPACING.base * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sansBold,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  section: {
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementCard: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  achievementName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementLevel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  menuSection: {
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  dangerSection: {
    paddingHorizontal: SPACING.base,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dangerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.terracotta,
    fontWeight: '500',
  },
});

export default ProfileScreen;
