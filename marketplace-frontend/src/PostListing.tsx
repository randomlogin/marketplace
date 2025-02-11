import { useState, useRef } from 'preact/hooks';
import { route } from 'preact-router';
import { postListing, Listing } from './api';

export default function PostListing() {
  const [rawInput, setRawInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateJSON = (input: string): string | null => {
    try {
      const data = JSON.parse(input);
      if (!data.space) return 'Missing space field';
      if (!data.price) return 'Missing price field';
      if (!data.seller) return 'Missing seller field';
      if (!data.signature) return 'Missing signature field';
      if (!(data.signature.length==128)) return 'Signature has invalid length';
      if (typeof data.price !== 'number') return 'Price must be a number';
      if (data.price <= 0) return 'Price must be greater than 0';
      if (!data.space.startsWith('@')) return 'Space must start with @';
 
      if (typeof data.price !== 'number') return 'Price must be a number';
      return null;
    } catch {
      return 'Invalid JSON format';
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateJSON(rawInput);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const data = JSON.parse(rawInput);
      const listing: Listing = {
        space: data.space,
        price: Number(data.price),
        seller: data.seller,
        signature: data.signature
      };
      await postListing(listing);
      route(`/space/${data.space}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const pastedText = e.clipboardData?.getData('text');
    if (pastedText) {
      try {
        const parsed = JSON.parse(pastedText);
        const formatted = JSON.stringify(parsed, null, 2);
        setRawInput(formatted);
        e.preventDefault();
        setValidationError(validateJSON(formatted));
      } catch {
        // If not valid JSON, let default paste happen
      }
    }
  };

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLTextAreaElement).value;
    setRawInput(value);
    setValidationError(validateJSON(value));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const form = (e.target as HTMLTextAreaElement).form;
      form?.requestSubmit();
    }
  };

  const handleClear = () => {
    setRawInput('');
    setError(null);
    setValidationError(null);
    textareaRef.current?.focus();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawInput);
    } catch (err) {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
      }
    }
  };

  return (
    <div class="w-full max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold mb-6">Post New Listing</h1>
      
      {error && (
        <div class="border border-red-500 rounded p-4 mb-6 bg-red-100">
          <p class="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} class="space-y-6">
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium">
              Paste Listing JSON
            </label>
            <span class="text-sm opacity-75">Press Ctrl+Enter to submit</span>
          </div>
          
          <div class="relative">
            <textarea
              ref={textareaRef}
              value={rawInput}
              onInput={handleInput}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              placeholder={`{
  "space": "@example",
  "price": 100,
  "seller": "seller_address",
  "signature": "signature_string"
}`}
              rows={10}
              class={`w-full p-3 border rounded-lg font-mono text-sm bg-opacity-10 ${
                validationError 
                  ? 'border-red-500' 
                  : rawInput && !validationError 
                    ? 'border-green-500' 
                    : 'border-opacity-20'
              }`}
            />
            {validationError && (
              <p class="mt-1 text-sm text-red-600">{validationError}</p>
            )}
          </div>
        </div>

        <div class="flex space-x-4">
          <button
            type="submit"
            disabled={submitting || !!validationError}
            class="flex-1 px-4 py-2 rounded-lg border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Post Listing'}
          </button>
          
          <button
            type="button"
            onClick={handleCopy}
            disabled={!rawInput}
            class="px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            Copy
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            disabled={!rawInput}
            class="px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
