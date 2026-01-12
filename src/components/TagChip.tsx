import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface TagChipProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  variant?: 'home' | 'saved' | 'filter';
}

export const TagChip: React.FC<TagChipProps> = ({
  label,
  isActive = false,
  onPress,
  variant = 'home',
}) => {
  const getStyles = () => {
    if (variant === 'filter') {
      return {
        container: isActive ? styles.filterActiveContainer : styles.filterContainer,
        text: isActive ? styles.filterActiveText : styles.filterText,
      };
    }

    if (variant === 'saved') {
      return {
        container: styles.savedContainer,
        text: styles.savedText,
      };
    }

    return {
      container: styles.homeContainer,
      text: styles.homeText,
    };
  };

  const chipStyles = getStyles();

  return (
    <TouchableOpacity
      style={chipStyles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={chipStyles.text}>
        {variant === 'filter' ? label.charAt(0).toUpperCase() + label.slice(1) : label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Home screen variant - transparent with border
  homeContainer: {
    paddingHorizontal: Math.min(16, width * 0.04),
    paddingVertical: Math.min(8, width * 0.02),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 4,
  },
  homeText: {
    fontSize: Math.min(12, width * 0.03),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },

  // Saved screen card variant
  savedContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  savedText: {
    fontSize: Math.min(11, width * 0.028),
    fontWeight: '600',
    color: '#8B7355',
    letterSpacing: 1,
  },

  // Filter variant - for tag filtering (matches design: terracotta active, white inactive)
  filterContainer: {
    paddingHorizontal: Math.min(20, width * 0.05),
    paddingVertical: Math.min(10, width * 0.025),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0D5C7',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  filterText: {
    fontSize: Math.min(13, width * 0.033),
    fontWeight: '500',
    color: '#5C5C5C',
  },
  filterActiveContainer: {
    paddingHorizontal: Math.min(20, width * 0.05),
    paddingVertical: Math.min(10, width * 0.025),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C4785A',
    backgroundColor: '#C4785A',
    marginHorizontal: 4,
  },
  filterActiveText: {
    fontSize: Math.min(13, width * 0.033),
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
