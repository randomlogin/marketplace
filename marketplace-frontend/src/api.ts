import { normalizeSpace } from "./helpers"
const API_BASE = "/api"

export interface Listing {
  space: string;
  price: number;
  seller: string;
  signature: string;
}


export interface ListingResponse {
  space: string;
  price: number;
  seller: string;
  signature: string;
  timestamp: number;
}

interface ListingsParams {
  sort_by?: 'price' | 'timestamp';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function getListings(params: ListingsParams = {}): Promise<ListingResponse[]> {
  const queryParams = new URLSearchParams();

  if (params.sort_by) {
    queryParams.append('sort_by', params.sort_by);
  }
  if (params.sort_order) {
    queryParams.append('sort_order', params.sort_order);
  }
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params.offset) {
    queryParams.append('offset', params.offset.toString());
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE}/listings${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch listings');
  }

  return response.json();
}

export async function getSpaceListing(name: string): Promise<ListingResponse> {
  name = normalizeSpace(name)
  const response = await fetch(`${API_BASE}/space/@${name}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`No listings found for ${name}`);
    }
    throw new Error(`Failed to fetch listing for ${name}`);
  }
  return response.json();
}

export async function postListing(listingData: Listing): Promise<ListingResponse> {
  const response = await fetch(`${API_BASE}/postListing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(listingData),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError);
      throw new Error('Internal server error');
    }

    // Now we can safely throw the API error outside the try/catch
    if (errorData && (errorData.error || errorData.message)) {
      const errorMsg = errorData.error || errorData.messahe
      throw new Error(errorMsg[0].toUpperCase() + errorMsg.slice(1));
    }

    // If we somehow get here without an error message, fall back to status code
    throw new Error(`Request failed with status: ${response.status}`);
  }

  return response.json();
}
