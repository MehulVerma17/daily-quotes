/**
 * Centralized UI Strings
 *
 * All user-facing text in the app is defined here for:
 * - Consistent terminology across screens
 * - Easy updates in one place
 * - Future i18n/localization support
 */

export const STRINGS = {
  // ============================================
  // APP INFO
  // ============================================
  APP: {
    NAME: 'QuoteVault',
    TAGLINE: 'YOUR DAILY DOSE OF WISDOM',
    VERSION_PREFIX: 'QUOTEVAULT V',
  },

  // ============================================
  // COMMON / SHARED
  // ============================================
  COMMON: {
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    REMOVE: 'Remove',
    SAVE: 'Save',
    OK: 'OK',
    ERROR: 'Error',
    LOADING: 'Loading...',
    SYNCED: 'SYNCED',
    ALL: 'All',
    AND: 'and',
  },

  // ============================================
  // AUTHENTICATION
  // ============================================
  AUTH: {
    // Button Labels
    SIGN_IN: 'Sign In',
    SIGN_UP: 'Sign Up',
    CREATE_ACCOUNT: 'Create Account',
    FORGOT_PASSWORD: 'Forgot Password?',
    RESET_PASSWORD: 'Reset Password',
    SEND_RESET_LINK: 'Send Reset Link',
    EMAIL_SENT: 'Email Sent!',
    RESEND_EMAIL: "Didn't receive email? Try again",
    BACK_TO_SIGN_IN: 'Back to Sign In',
    LOG_OUT: 'Log Out',

    // Input Labels
    EMAIL: 'Email',
    EMAIL_ADDRESS: 'Email Address',
    PASSWORD: 'Password',
    FULL_NAME: 'Full Name',
    CONFIRM_PASSWORD: 'Confirm Password',

    // Placeholders
    ENTER_EMAIL: 'Enter your email',
    ENTER_EMAIL_EXAMPLE: 'email@example.com',
    ENTER_PASSWORD: 'Enter your password',
    CREATE_PASSWORD: 'Create a password',
    ENTER_NAME: 'Enter your full name',
    CONFIRM_PASSWORD_PLACEHOLDER: 'Confirm your password',

    // Screen Text
    START_JOURNEY: 'Start your quote journey',
    DONT_HAVE_ACCOUNT: "Don't have an account?",
    ALREADY_HAVE_ACCOUNT: 'Already have an account?',
    RESET_PASSWORD_DESC: "Enter the email associated with your account and we'll send an email with instructions to reset your password.",

    // Terms
    AGREE_TO: 'I agree to the',
    TERMS_OF_SERVICE: 'Terms of Service',
    PRIVACY_POLICY: 'Privacy Policy',

    // Password Strength
    PASSWORD_WEAK: 'Weak',
    PASSWORD_MEDIUM: 'Medium strength',
    PASSWORD_STRONG: 'Strong',
    PASSWORD_VERY_STRONG: 'Very strong',

    // Toast Messages - Titles
    EMAIL_REQUIRED: 'Email Required',
    INVALID_EMAIL: 'Invalid Email',
    PASSWORD_REQUIRED: 'Password Required',
    INVALID_PASSWORD: 'Invalid Password',
    NAME_REQUIRED: 'Name Required',
    WEAK_PASSWORD: 'Weak Password',
    PASSWORDS_DONT_MATCH: "Passwords Don't Match",
    TERMS_REQUIRED: 'Terms Agreement Required',
    ACCOUNT_CREATED: 'Account Created!',
    SIGN_IN_FAILED: 'Sign In Failed',
    SIGN_UP_FAILED: 'Sign Up Failed',
    RESET_FAILED: 'Reset Failed',

    // Toast Messages - Descriptions
    EMAIL_REQUIRED_DESC: 'Please enter your email address',
    INVALID_EMAIL_DESC: 'Please enter a valid email address',
    PASSWORD_REQUIRED_DESC: 'Please enter your password',
    INVALID_PASSWORD_DESC: 'Password must be at least 6 characters',
    NAME_REQUIRED_DESC: 'Please enter your full name',
    WEAK_PASSWORD_DESC: 'Password must be at least 6 characters',
    PASSWORDS_DONT_MATCH_DESC: 'Please make sure your passwords match',
    TERMS_REQUIRED_DESC: 'Please agree to the Terms of Service and Privacy Policy',
    ACCOUNT_CREATED_DESC: 'Please check your email to verify your account',
    SIGN_IN_FAILED_DESC: 'Please check your credentials and try again',
    SIGN_UP_FAILED_DESC: 'Please try again',
    RESET_SENT_DESC: 'Check your inbox for password reset instructions',
    RESET_FAILED_DESC: 'Please try again',
  },

  // ============================================
  // HOME SCREEN
  // ============================================
  HOME: {
    GREETING_MORNING: 'Good Morning',
    GREETING_AFTERNOON: 'Good Afternoon',
    GREETING_EVENING: 'Good Evening',
    QUOTE_OF_DAY: 'Quote of the Day',
    TODAYS_CATEGORIES: "Today's Categories",
    DISCOVER_MORE: 'Discover More',
  },

  // ============================================
  // FAVORITES SCREEN
  // ============================================
  FAVORITES: {
    TITLE: 'Saved Favorites',
    EMPTY_TITLE: 'No favorites yet',
    EMPTY_DESC: 'Tap the heart icon on quotes you love to save them here',
    STAT_FAVORITES: 'Favorites',
    STAT_CATEGORIES: 'Categories',
    STAT_AUTHORS: 'Authors',
  },

  // ============================================
  // SEARCH SCREEN
  // ============================================
  SEARCH: {
    TITLE: 'Search',
    PLACEHOLDER: 'Search quotes, authors...',
    FILTER_ALL: 'All',
    FILTER_AUTHOR: 'By Author',
    FILTER_CATEGORY: 'By Category',
    NO_RESULTS: 'No results found',
    SEARCH_PROMPT: 'Search for quotes',
    TRY_AGAIN: 'Try searching for something else',
    HINT: 'Find quotes by keywords or authors',
  },

  // ============================================
  // COLLECTIONS
  // ============================================
  COLLECTIONS: {
    TITLE: 'My Collections',
    NEW_COLLECTION: 'New Collection',
    CREATE_COLLECTION: 'Create Collection',
    NAME_LABEL: 'Name',
    NAME_PLACEHOLDER: 'Enter collection name',
    ICON_LABEL: 'Icon',
    COLOR_LABEL: 'Color',
    EMPTY_TITLE: 'No collections yet',
    EMPTY_DESC: 'Create collections to organize your favorite quotes',
    REMOVE_QUOTE: 'Remove Quote',
    REMOVE_QUOTE_DESC: 'Are you sure you want to remove this quote from the collection?',
    DELETE_COLLECTION: 'Delete Collection',
    DELETE_COLLECTION_DESC: 'Are you sure you want to delete this collection? This cannot be undone.',
    NO_QUOTES_TITLE: 'No quotes yet',
    NO_QUOTES_DESC: 'Add quotes to this collection from your favorites or browse',
    ADDED_SUCCESS: 'Added to Collection',
    ADDED_SUCCESS_DESC: (name: string) => `Quote added to "${name}"`,
    ADD_FAILED: 'Failed to add quote to collection',
    LOAD_FAILED: 'Failed to load collections',
  },

  // ============================================
  // PROFILE SCREEN
  // ============================================
  PROFILE: {
    TITLE: 'Profile',
    MEMBER_SINCE: 'Member since',
    PREFERENCES: 'Preferences',
    LOG_OUT_CONFIRM: 'Are you sure you want to log out?',
    DELETE_ACCOUNT: 'Delete Account',
    DELETE_ACCOUNT_DESC: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
    CHANGE_PHOTO: 'Change Profile Photo',
    CHOOSE_OPTION: 'Choose an option',
    TAKE_PHOTO: 'Take Photo',
    CHOOSE_GALLERY: 'Choose from Gallery',
    CAMERA_PERMISSION: 'Camera permission is required to take photos.',
    GALLERY_PERMISSION: 'Gallery permission is required to select photos.',
    PERMISSION_NEEDED: 'Permission needed',
  },

  // ============================================
  // SETTINGS SCREEN
  // ============================================
  SETTINGS: {
    // Sections
    APPEARANCE: 'Appearance',
    NOTIFICATIONS: 'Notifications',
    DATA_SECURITY: 'Data & Security',

    // Theme
    THEME_LIGHT: 'Light',
    THEME_DARK: 'Dark',
    THEME_SYSTEM: 'System',
    ACCENT_COLOR: 'Accent Color',
    REMINDER_TIME: 'Reminder Time',

    // Font Size Preview
    FONT_PREVIEW_QUOTE: 'The journey is the reward',

    // Notifications
    DAILY_QUOTE: 'Daily Quote',
    DAILY_QUOTE_DESC: 'Receive a fresh quote every morning',
    CLOUD_SYNC: 'Cloud Sync',
    CLOUD_SYNC_DESC: 'Keep quotes across all devices',
    LAST_SYNCED: 'Last synced: 2 mins ago',
    SYNC_NOW: 'Sync Now',

    // Footer
    PRIVACY_POLICY: 'Privacy Policy',
    TERMS_OF_SERVICE: 'Terms of Service',

    // Toast Messages
    PERMISSION_REQUIRED: 'Permission Required',
    PERMISSION_REQUIRED_DESC: 'Please enable notifications in your device settings to receive daily quotes.',
    NOTIFICATIONS_ENABLED: 'Daily Quote Enabled',
    NOTIFICATIONS_ENABLED_DESC: (time: string) => `Next notification: ${time}`,
    NOTIFICATIONS_DISABLED: 'Notifications Disabled',
    NOTIFICATIONS_DISABLED_DESC: "You won't receive daily quote reminders",
    TEST_SENT: 'Test Sent',
    TEST_SENT_DESC: 'You should receive a notification now!',
    TEST_FAILED: 'Failed to send test notification',
    REMINDER_SET: 'Reminder Set',
  },

  // ============================================
  // MODALS
  // ============================================
  MODALS: {
    ADD_TO_COLLECTION: 'Add to Collection',
    SHARE_QUOTE: 'Share Quote',
    CHOOSE_STYLE: 'Choose a style',
    SAVE_TO_PHOTOS: 'Save to Photos',
    SHARE_VIA: 'Share via...',
    PHOTO_SAVED: 'Quote card saved to photos!',
    PHOTO_SAVE_FAILED: 'Failed to save image',
    MEDIA_PERMISSION: 'Permission to access media library is required!',
    TEMPLATE_GRADIENT: 'Gradient',
    TEMPLATE_MINIMAL: 'Minimal',
    TEMPLATE_DARK: 'Dark',
  },

  // ============================================
  // OFFLINE
  // ============================================
  OFFLINE: {
    NO_CONNECTION: 'No internet connection',
  },

  // ============================================
  // CATEGORY SCREEN
  // ============================================
  CATEGORY: {
    EMPTY_TITLE: 'No quotes yet',
    EMPTY_DESC: 'Quotes in this category will appear here',
  },

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  quoteCount: (count: number): string =>
    `${count} ${count === 1 ? 'quote' : 'quotes'}`,
};

export default STRINGS;
