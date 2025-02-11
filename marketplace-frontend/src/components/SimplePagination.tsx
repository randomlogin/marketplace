import { memo } from 'preact/compat';

interface SimplePaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

const SimplePagination = memo(({ currentPage, hasNextPage, onPageChange }: SimplePaginationProps) => {
  return (
    <nav className="flex items-center justify-center mt-8 space-x-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      
      <span className="text-sm text-gray-700">
        Page {currentPage}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </nav>
  );
});

export default SimplePagination;
