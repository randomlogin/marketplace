import { ListingResponse } from '../api';
import { formatBTC, spaceToUnicode } from '../helpers';

interface ListingCardProps {
  listing: ListingResponse;
  currentPage?: number;
}

export default function ListingCard({ listing, currentPage }: ListingCardProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };
  
  // Check if the space name is in punycode format
  const isPunycode = listing.space.includes('xn--');
  
  // Get display version (if it's punycode, convert to unicode for display)
  let displaySpace = listing.space;
  let unicodeVersion = '';
  
  if (isPunycode) {
    unicodeVersion = spaceToUnicode(listing.space);
  }
  
  const listingUrl = `/space/${encodeURIComponent(listing.space)}?from=${currentPage}`;
  
  return (
    <a 
      href={listingUrl}
      class="block transform transition-all duration-200 hover:scale-105"
    >
      <div class="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold text-gray-900">
            @{displaySpace} {isPunycode && unicodeVersion && `(${unicodeVersion})`}
          </h2>
          <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            {formatBTC(listing.price)} 
          </span>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="flex items-center text-sm text-gray-500">
            <span class="font-medium mr-2">Seller:</span>
            <span class="font-mono">{formatAddress(listing.seller)}</span>
          </div>
          {listing.timestamp && (
            <div class="mt-2 text-sm text-gray-400">
              Listed {new Date(listing.timestamp*1000).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
