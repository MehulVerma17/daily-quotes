import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
  isActive?: boolean;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onPress,
  size = 'medium',
  variant = 'secondary',
  isActive = false,
  disabled = false,
}) => {
  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { width: 44, height: 44 };
      case 'large':
        return { width: 72, height: 72 };
      default:
        return { width: 56, height: 56 };
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const getIconColor = (): string => {
    if (isActive) {
      return '#C4785A';
    }
    if (variant === 'primary') {
      return '#FFFFFF';
    }
    return '#3D3D3D';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getSizeStyles(),
        variant === 'primary' && styles.primaryContainer,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  disabled: {
    opacity: 0.5,
  },
});
