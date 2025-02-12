import { Ghost } from 'lucide-react';
import { route } from 'preact-router';

export default function NotFound() {
  const handleBack = () => {
    route('/', true);
  };

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Ghost className="h-24 w-24 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            This page doesn't exist or may have been moved.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
          >
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
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
