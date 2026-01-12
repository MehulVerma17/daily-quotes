import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedQuote } from '../types';

const { width } = Dimensions.get('window');

interface QuoteCardProps {
  quote: SavedQuote;
  onRemoveFavorite: (id: string) => void;
  onShare: (quote: SavedQuote) => void;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'
  ];
  return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
};

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onRemoveFavorite,
  onShare,
}) => {
  const primaryTag = quote.tags.length > 0 ? quote.tags[0].toUpperCase() : 'INSPIRATION';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tagDate}>
          {primaryTag} • {formatDate(quote.savedAt)}
        </Text>
      </View>

      <Text style={styles.quoteText}>"{quote.content}"</Text>

      <View style={styles.footer}>
        <Text style={styles.author}>{quote.author.toUpperCase()}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onRemoveFavorite(quote._id)}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={22} color="#C4785A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(quote)}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={22} color="#8B7355" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: width * 0.05,
    marginHorizontal: width * 0.05,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  tagDate: {
    fontSize: Math.min(11, width * 0.028),
    fontWeight: '600',
    color: '#8B7355',
    letterSpacing: 1,
  },
  quoteText: {
    fontSize: Math.min(18, width * 0.045),
    fontStyle: 'italic',
    color: '#2D2D2D',
    lineHeight: Math.min(28, width * 0.07),
    fontFamily: 'serif',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0EBE3',
    paddingTop: 12,
  },
  author: {
    fontSize: Math.min(12, width * 0.03),
    fontWeight: '600',
    color: '#2D2D2D',
    letterSpacing: 1,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
});
