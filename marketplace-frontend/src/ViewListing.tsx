import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { getSpaceListing, ListingResponse } from './api';
import CopyCommand from './components/CopyCommand';
import { NETWORK, getSpaceExplorerLink } from './constants';

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
      setListing(data)
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
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="text-red-500">Error: {error}</div>
        <button 
          onClick={handleBack}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to listings
        </button>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-2xl mx-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">@{listing.space}</h2>
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
            <div className="text-3xl font-bold text-blue-700">{listing.price} sats</div>
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
