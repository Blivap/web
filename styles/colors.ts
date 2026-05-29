/**
 * Color Style Guide
 *
 * This file provides a centralized reference for all colors used in the application.
 * Use these constants instead of hardcoding hex values for better maintainability.
 *
 * Usage in Tailwind classes:
 * - bg-primary, text-primary, border-primary
 * - bg-secondary, text-secondary
 * - bg-text-primary, text-text-secondary
 * - bg-bg-primary, bg-bg-secondary
 * - border-border
 *
 * Usage in inline styles:
 * - style={{ color: colors.primary }}
 * - style={{ backgroundColor: colors.bgPrimary }}
 */

export const colors = {
  // Brand Colors
  primary: "#960018", // Dark red/maroon - Main brand color
  secondary: "#24AFB5", // Teal/cyan - Accent color for buttons and links

  // Text Colors
  textPrimary: "#171717", // Main text color
  textSecondary: "#585757", // Body text, secondary content
  textTertiary: "#959595", // Muted text
  textMuted: "#969696", // Footer text, very muted
  textInverse: "#ffffff", // White text for dark backgrounds
  textLight: "#ededed", // Light text for dark mode

  // Background Colors
  bgPrimary: "#ffffff", // Main background
  bgSecondary: "#F7F7F7", // Footer background, subtle sections
  bgDark: "#0a0a0a", // Dark mode background

  // Border & Neutral Colors
  border: "#DBDBDB", // Borders, dividers, placeholders
  neutral: "#DBDBDB", // Neutral gray for icons, placeholders
} as const;

/**
 * Color usage examples:
 *
 * 1. Primary brand color (buttons, logos, accents):
 *    className="bg-primary text-text-inverse"
 *    className="text-primary"
 *
 * 2. Secondary accent color (links, CTAs):
 *    className="bg-secondary text-text-inverse"
 *    className="text-secondary"
 *
 * 3. Text colors:
 *    className="text-text-primary"      // Main headings
 *    className="text-text-secondary"    // Body text
 *    className="text-text-tertiary"     // Muted text
 *    className="text-text-muted"        // Footer text
 *
 * 4. Backgrounds:
 *    className="bg-bg-primary"          // Main background
 *    className="bg-bg-secondary"       // Subtle sections
 *
 * 5. Borders:
 *    className="border-border"          // Standard borders
 *    className="border border-border"   // Border with width
 */
