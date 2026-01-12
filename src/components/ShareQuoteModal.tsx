/**
 * Share Quote Modal
 *
 * Modal for sharing quotes as images with different templates.
 * Matches design from image 12.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { COLORS, SPACING, RADIUS, FONTS, FONT_SIZES } from '../constants/theme';
import { Quote, CardTemplate } from '../types';

const { width } = Dimensions.get('window');

interface ShareQuoteModalProps {
  visible: boolean;
  onClose: () => void;
  quote: Quote | null;
}

// Template configurations
const TEMPLATES: { id: CardTemplate; name: string; gradient: readonly [string, string] }[] = [
  { id: 'gradient', name: 'Gradient', gradient: ['#E8A87C', '#D4A5A5'] as const },
  { id: 'minimal', name: 'Minimal', gradient: ['#FFFFFF', '#F5F5F5'] as const },
  { id: 'dark', name: 'Dark', gradient: ['#2D2D2D', '#1A1A1A'] as const },
];

export const ShareQuoteModal: React.FC<ShareQuoteModalProps> = ({
  visible,
  onClose,
  quote,
}) => {
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<ViewShot>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>('gradient');
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
  const isLightTemplate = selectedTemplate === 'minimal';
  const textColor = isLightTemplate ? COLORS.textPrimary : '#FFFFFF';
  const subtextColor = isLightTemplate ? COLORS.textMuted : 'rgba(255, 255, 255, 0.7)';

  const captureAndSave = async () => {
    if (!viewShotRef.current) return null;

    try {
      const uri = await viewShotRef.current.capture?.();
      return uri;
    } catch (error) {
      console.error('Error capturing view:', error);
      return null;
    }
  };

  const handleSaveToPhotos = async () => {
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access media library is required!');
        return;
      }

      const uri = await captureAndSave();
      if (uri) {
        await MediaLibrary.saveToLibraryAsync(uri);
        alert('Quote card saved to photos!');
      }
    } catch (error) {
      console.error('Error saving to photos:', error);
      alert('Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      if (Platform.OS === 'web') {
        // Web fallback to text sharing
        await Share.share({
          message: `"${quote?.content}"\n\n— ${quote?.author}`,
        });
      } else {
        const uri = await captureAndSave();
        if (uri && (await Sharing.isAvailableAsync())) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Quote',
          });
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setSharing(false);
    }
  };

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
            <Text style={styles.headerTitle}>Share Quote</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Quote Card Preview */}
          <View style={styles.previewContainer}>
            <ViewShot
              ref={viewShotRef}
              options={{ format: 'png', quality: 1 }}
              style={styles.viewShot}
            >
              <LinearGradient
                colors={currentTemplate.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quoteCard}
              >
                {/* Quote Icon */}
                <Text style={[styles.quoteIcon, { color: subtextColor }]}>"</Text>

                {/* Quote Text */}
                <Text style={[styles.quoteText, { color: textColor }]}>
                  "{quote.content}"
                </Text>

                {/* Author */}
                <View style={styles.authorContainer}>
                  <View style={[styles.authorLine, { backgroundColor: subtextColor }]} />
                  <Text style={[styles.authorText, { color: subtextColor }]}>
                    {quote.author.toUpperCase()}
                  </Text>
                </View>
              </LinearGradient>
            </ViewShot>
          </View>

          {/* Template Selector */}
          <View style={styles.templateSelector}>
            <Text style={styles.templateLabel}>Choose a style</Text>
            <View style={styles.templateOptions}>
              {TEMPLATES.map((template) => (
                <Pressable
                  key={template.id}
                  style={[
                    styles.templateOption,
                    selectedTemplate === template.id && styles.templateOptionActive,
                  ]}
                  onPress={() => setSelectedTemplate(template.id)}
                >
                  <LinearGradient
                    colors={template.gradient}
                    style={styles.templatePreview}
                  />
                  <Text
                    style={[
                      styles.templateName,
                      selectedTemplate === template.id && styles.templateNameActive,
                    ]}
                  >
                    {template.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={styles.saveButton}
              onPress={handleSaveToPhotos}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Save to Photos</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.shareButton}
              onPress={handleShare}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator size="small" color={COLORS.terracotta} />
              ) : (
                <>
                  <Ionicons name="share-outline" size={20} color={COLORS.terracotta} />
                  <Text style={styles.shareButtonText}>Share via...</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const cardWidth = width - SPACING.base * 4;
const cardHeight = cardWidth * 1.2;

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
  previewContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  viewShot: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  quoteCard: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteIcon: {
    fontSize: 64,
    fontFamily: FONTS.serifBold,
    marginBottom: SPACING.md,
    opacity: 0.5,
  },
  quoteText: {
    fontSize: FONT_SIZES.xl,
    fontStyle: 'italic',
    fontFamily: FONTS.serifItalic,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: SPACING.lg,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  authorLine: {
    width: 24,
    height: 1,
  },
  authorText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    letterSpacing: 2,
  },
  templateSelector: {
    marginBottom: SPACING.lg,
  },
  templateLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  templateOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  templateOption: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateOptionActive: {
    borderColor: COLORS.terracotta,
  },
  templatePreview: {
    width: 60,
    height: 80,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  templateName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  templateNameActive: {
    color: COLORS.terracotta,
    fontWeight: '600',
  },
  actions: {
    gap: SPACING.sm,
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.terracotta,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  shareButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.terracotta,
    gap: SPACING.sm,
  },
  shareButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.terracotta,
  },
});

export default ShareQuoteModal;
