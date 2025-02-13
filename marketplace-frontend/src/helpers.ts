export function normalizeSpace(space : string): string {
  space = space.startsWith('@') ? space.substring(1) : space;
  return space.toLocaleLowerCase()
}

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
