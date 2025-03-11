import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { getSpaceListing, ListingResponse } from './api';
import CopyCommand from './components/CopyCommand';
import { NETWORK, getSpaceExplorerLink } from './constants';
import { Ghost } from 'lucide-react';
import { normalizeSpace, formatBTC, spaceToUnicode, isPunycode } from "./helpers";

interface Props {
  name: string;
  page?: string;
}

export default function ViewListing({ name }: Props) {
  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (name) {
      loadListing();
    }
  }, [name]);

  async function loadListing() {
    try {
      setLoading(true);
      setError(null);
      const data = await getSpaceListing(name);
      setListing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }
  
  const handleBack = () => {
    const params = new URLSearchParams(window.location.search);
    const fromPage = params.get('from');

    if (fromPage && !isNaN(Number(fromPage))) {
      route(`/?page=${fromPage}`, true);
    } else {
      route('/', true);
    }
  };

  const getBuyCommand = () => {
    if (!listing) return '';
    return `space-cli --chain ${NETWORK} buy ${listing.space} ${listing.price} --seller ${listing.seller} --signature ${listing.signature} `;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    // Get the normalized space name
    const normalizedName = normalizeSpace(name);
    
    // Format the display name - if punycode, show decoded version in parentheses
    let displayName = normalizedName;
    if (isPunycode(normalizedName)) {
      const decoded = spaceToUnicode(normalizedName);
      if (decoded !== normalizedName) {
        displayName = `${normalizedName} (${decoded})`;
      }
    }
    
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <Ghost className="h-24 w-24 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No valid listings found for @{displayName}
            </h2>
            <p className="text-gray-600 mb-6">
              The listing you're looking for might have become invalid or never existed.
            </p>
            <button onClick={handleBack} className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200" >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  // Format the display space name - if punycode, show decoded version in parentheses
  let displaySpace = listing.space;
  if (isPunycode(listing.space)) {
    const decoded = spaceToUnicode(listing.space);
    if (decoded !== listing.space) {
      displaySpace = `${listing.space} (${decoded})`;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-2xl mx-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">@{displaySpace}</h2>
            <a href={getSpaceExplorerLink(listing.space)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              view on explorer
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {new Date(listing.timestamp*1000).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Back</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-lg font-medium text-blue-900">Price</div>
            <div className="text-3xl font-bold text-blue-700">{formatBTC(listing.price)}</div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Seller Address</label>
                <div className="mt-1 font-mono text-sm break-all">
                  {listing.seller}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Signature</label>
                <div className="mt-1 font-mono text-xs break-all text-gray-600">
                  {listing.signature}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                CLI Command
              </label>
              <div className="bg-black rounded-lg">
                <CopyCommand command={getBuyCommand()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
