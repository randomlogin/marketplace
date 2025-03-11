import { route } from 'preact-router';
import { useState } from 'preact/hooks';
import { normalizeSpace, spaceToPunycode } from '../helpers';

export default function Header() {
  const [search, setSearch] = useState('');

  const handleSearch = (e: Event) => {
    e.preventDefault();
    if (search.trim()) {
      // Normalize and convert to punycode if needed
      const normalizedSpace = normalizeSpace(search);
      const punycodeSpace = spaceToPunycode(normalizedSpace);
      
      route(`/space/${encodeURIComponent(punycodeSpace)}`);
      setSearch('');
    }
  };

  const handleHome = (e: Event) => {
    e.preventDefault();
    route('/', true);
    window.scrollTo(0, 0);
  };

  const handlePost = (e: Event) => {
    e.preventDefault();
    route('/post', true);
  };

  return (
    <header class="bg-white shadow-sm">
      <nav class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <ul class="flex space-x-6">
            <li>
              <a href="/" onClick={handleHome} class="text-gray-800 hover:text-blue-600">
                All Listings
              </a>
            </li>
            <li>
              <a href="/post" onClick={handlePost} class="text-gray-800 hover:text-blue-600">
                Post a Listing
              </a>
            </li>
            <li>
              <a href="/faq" className="text-gray-800 hover:text-blue-600">
                How to Use
              </a>
            </li>
          </ul>
          <form onSubmit={handleSearch} class="flex max-w-md flex-1 ml-4">
            <input
              type="text"
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
              placeholder="Search space (e.g., @example)"
              class="w-full px-4 py-1 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              class="ml-2 px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={!search.trim()}
            >
              Search
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
