/**
 * Widget Task Handler
 *
 * Handles Android widget tasks like rendering and click actions.
 */

import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { QuoteWidget } from './QuoteWidget';

const nameToWidget: Record<string, React.FC<any>> = {
  QuoteWidget: QuoteWidget,
};

async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget = nameToWidget[widgetInfo.widgetName];

  if (!Widget) {
    console.warn(`Unknown widget: ${widgetInfo.widgetName}`);
    return;
  }

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      // Render widget with default quote
      // In future, could fetch stored daily quote from AsyncStorage
      props.renderWidget(<Widget />);
      break;

    case 'WIDGET_DELETED':
      // Widget removed from home screen
      break;

    case 'WIDGET_CLICK':
      // Handle click action - will open app by default due to clickAction="OPEN_APP"
      break;

    default:
      break;
  }
}

registerWidgetTaskHandler(widgetTaskHandler);
