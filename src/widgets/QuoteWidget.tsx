/**
 * QuoteWidget Component
 *
 * Android home screen widget that displays the quote of the day.
 * Uses react-native-android-widget's FlexWidget primitives.
 */

import React from 'react';
import {
  FlexWidget,
  TextWidget,
} from 'react-native-android-widget';

interface QuoteWidgetProps {
  quote?: string;
  author?: string;
}

export function QuoteWidget({
  quote = "The only way to do great work is to love what you do.",
  author = "Steve Jobs"
}: QuoteWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F1EB',
        borderRadius: 16,
        padding: 16,
      }}
      clickAction="OPEN_APP"
    >
      {/* Quote text */}
      <TextWidget
        text={`"${quote}"`}
        style={{
          fontSize: 16,
          fontFamily: 'serif',
          color: '#2D2D2D',
          textAlign: 'center',
          marginBottom: 12,
        }}
        maxLines={4}
      />

      {/* Author */}
      <TextWidget
        text={`— ${author}`}
        style={{
          fontSize: 14,
          fontStyle: 'italic',
          color: '#6B6B6B',
          textAlign: 'center',
        }}
        maxLines={1}
      />
    </FlexWidget>
  );
}
