declare module 'punycode';

import * as punycode from 'punycode';

// export function normalizeSpace(space : string): string {
//   space = space.startsWith('@') ? space.substring(1) : space;
//   return space.toLocaleLowerCase()
// }
//

export function formatBTC(satoshis: number | undefined): string {
    if (satoshis === undefined || satoshis === null) {
        return '0 sat';
    }
    const BTC_THRESHOLD = 10000n;
    if (satoshis >= BTC_THRESHOLD) {
        const btc = Number(satoshis) / 100000000;
        const btcString = btc.toString();
        const [whole, decimal] = btcString.split('.');

        // Format whole number part with spaces
        const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

        if (!decimal) {
            return `${formattedWhole} BTC`;
        }

        // Find last non-zero digit
        const lastSignificantIndex = decimal.split('').reverse().findIndex(char => char !== '0');
        if (lastSignificantIndex === -1) {
            return `${formattedWhole} BTC`;
        }

        // Calculate required decimal places (minimum 3, maximum 8)
        const significantDecimals = Math.max(3, Math.min(8, decimal.length - lastSignificantIndex));
        const formattedDecimal = decimal.slice(0, significantDecimals);

        return `${formattedWhole}.${formattedDecimal} BTC`;
    }
    // Format satoshis with spaces
    return satoshis.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' sat';
}

/**
 * Normalizes a space name by removing '@' prefix and converting to lowercase
 *
 * @param {string} space - The space name to normalize
 * @returns {string} - The normalized space name
 */
export function normalizeSpace(space: string): string {
  if (!space) return '';
  space = space.startsWith('@') ? space.substring(1) : space;
  return space.toLowerCase();
}

/**
 * Checks if a space name is in punycode format
 *
 * @param {string} space - The space name to check
 * @returns {boolean} - True if in punycode format
 */
export function isPunycode(space: string): boolean {
  return space.includes('xn--');
}

/**
 * Converts a Punycode (ASCII) space name to Unicode for display
 *
 * @param {string} space - The Punycode space name
 * @returns {string} - The Unicode representation
 */
export function spaceToUnicode(space: string): string {
  try {
    // Skip conversion if not punycode
    if (!space.includes('xn--')) {
      return space;
    }

    // Split space into parts
    const parts = space.split('.');

    // Convert each xn-- part to unicode
    const unicodePartsArray = parts.map(part => {
      if (part.startsWith('xn--')) {
        // Remove the xn-- prefix and decode
        return punycode.decode(part.slice(4));
      }
      return part;
    });

    // Join parts back with dots
    return unicodePartsArray.join('.');
  } catch (error) {
    console.error('Error converting to Unicode:', error);

    // Remove the Intl.DisplayNames fallback as it's causing TypeScript errors
    // and the main punycode method should be sufficient
    return space;
  }
}

/**
 * Converts a Unicode space name to Punycode (ASCII)
 *
 * @param {string} space - The Unicode space name
 * @returns {string} - The Punycode representation
 */
export function spaceToPunycode(space: string): string {
  try {
    // First normalize
    space = normalizeSpace(space);

    // Skip conversion if already punycode
    if (isPunycode(space)) {
      return space;
    }

    // Split space into parts
    const parts = space.split('.');

    // Convert each Unicode part to punycode if needed
    const punycodePartsArray = parts.map(part => {
      // Check if part contains non-ASCII characters
      if (/[^\x00-\x7F]/.test(part)) {
        return 'xn--' + punycode.encode(part);
      }
      return part;
    });

    // Join parts back with dots
    return punycodePartsArray.join('.');
  } catch (error) {
    console.error('Error converting to Punycode:', error);

    // Fallback to browser's URL constructor
    try {
      const url = new URL(`https://${space}`);
      return url.hostname;
    } catch (urlError) {
      console.error('URL fallback failed:', urlError);
      return space;
    }
  }
}
