import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { getListings, ListingResponse } from './api';
import ListingCard from './components/ListingCard';
import SimplePagination from './components/SimplePagination';

const ITEMS_PER_PAGE = 9;

type SortBy = 'timestamp' | 'price';
type SortOrder = 'asc' | 'desc';

interface SortOption {
  label: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

const sortOptions: SortOption[] = [
  { label: 'Newest First', sortBy: 'timestamp', sortOrder: 'desc' },
  { label: 'Oldest First', sortBy: 'timestamp', sortOrder: 'asc' },
  { label: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
  { label: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
];

export default function Home() {
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);
  
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('page') || '1');
  });
  
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageFromUrl = parseInt(params.get('page') || '1');
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [window.location.search]);

  useEffect(() => {
    loadListings();
  }, [currentPage, selectedSort]);

  async function loadListings() {
    try {
      setLoading(true);
      const data = await getListings({
        limit: ITEMS_PER_PAGE + 1,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        sort_by: selectedSort.sortBy,
        sort_order: selectedSort.sortOrder
      });
      setHasNextPage(data.length > ITEMS_PER_PAGE);
      setListings(data.slice(0, ITEMS_PER_PAGE));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    route(page === 1 ? '/' : `/?page=${page}`);
  };

  const handleSortChange = (e: Event) => {
    const select = e.target as HTMLSelectElement;
    const option = sortOptions[select.selectedIndex];
    setSelectedSort(option);
    setCurrentPage(1); // Reset to first page when sorting changes
    route('/'); // Reset URL to home when sorting changes
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-gray-600">Loading listings...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-red-500">Error: {error}</div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
  <h1 className="text-3xl font-bold text-gray-900">Latest Listings</h1>
  <div className="relative">
    <select
      value={sortOptions.indexOf(selectedSort)}
      onChange={handleSortChange}
      className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8
                shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                text-gray-700 text-sm cursor-pointer hover:border-gray-400"
    >
      {sortOptions.map((option, index) => (
        <option key={option.label} value={index}>
          {option.label}
        </option>
      ))}
    </select>
    {/* Custom dropdown arrow */}
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</div>
     <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {listings.map(listing => (
          <ListingCard 
            key={listing.signature} 
            listing={listing} 
            currentPage={currentPage}
          />
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No listings available at the moment
        </div>
      )}

      {(currentPage > 1 || hasNextPage) && (
        <SimplePagination
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
