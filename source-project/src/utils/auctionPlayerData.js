const AUCTION_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const pendingRequests = new Map();
const recentResults = new Map();
const RECENT_RESULT_TTL = 15_000;

function getCacheKey(apiUrl) {
  return `wbl-public-auction-players:${apiUrl}`;
}

export function readAuctionPlayerCache(apiUrl) {
  try {
    const cached = JSON.parse(window.localStorage.getItem(getCacheKey(apiUrl)) || 'null');
    return {
      catalogue: Array.isArray(cached?.catalogue) ? cached.catalogue : [],
      registrations: Array.isArray(cached?.registrations) ? cached.registrations : [],
      hasCatalogue: Array.isArray(cached?.catalogue),
      hasRegistrations: Array.isArray(cached?.registrations),
    };
  } catch {
    return {
      catalogue: [],
      registrations: [],
      hasCatalogue: false,
      hasRegistrations: false,
    };
  }
}

async function fetchPlayerList(apiUrl, endpoint, errorMessage) {
  const response = await fetch(`${apiUrl}${endpoint}`);
  if (!response.ok) throw new Error(errorMessage);

  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(errorMessage);

  return data;
}

export function fetchPublicAuctionPlayerData(apiUrl = AUCTION_API_URL) {
  const pendingRequest = pendingRequests.get(apiUrl);
  if (pendingRequest) return pendingRequest;

  const recentRequest = recentResults.get(apiUrl);
  if (recentRequest && Date.now() - recentRequest.fetchedAt < RECENT_RESULT_TTL) {
    return Promise.resolve(recentRequest.data);
  }

  const request = Promise.allSettled([
    fetchPlayerList(apiUrl, '/auction/catalogue', 'Could not load auction player statistics.'),
    fetchPlayerList(apiUrl, '/auction/registrations', 'Could not load approved auction players.'),
  ]).then((results) => {
    const [catalogueResult, registrationsResult] = results;
    const cached = readAuctionPlayerCache(apiUrl);

    if (catalogueResult.status === 'fulfilled') cached.catalogue = catalogueResult.value;
    if (registrationsResult.status === 'fulfilled') cached.registrations = registrationsResult.value;

    try {
      window.localStorage.setItem(getCacheKey(apiUrl), JSON.stringify({
        catalogue: cached.catalogue,
        registrations: cached.registrations,
      }));
    } catch {
      // Public data remains available for this visit when browser storage is unavailable.
    }

    const data = {
      catalogue: catalogueResult.status === 'fulfilled' ? catalogueResult.value : null,
      catalogueError: catalogueResult.status === 'rejected' ? catalogueResult.reason : null,
      registrations: registrationsResult.status === 'fulfilled' ? registrationsResult.value : null,
    };
    if (catalogueResult.status === 'fulfilled' && registrationsResult.status === 'fulfilled') {
      recentResults.set(apiUrl, { data, fetchedAt: Date.now() });
    }
    return data;
  }).finally(() => {
    pendingRequests.delete(apiUrl);
  });

  pendingRequests.set(apiUrl, request);
  return request;
}

export function prefetchAuctionPage() {
  void import('../pages/Auction').catch(() => {});
  void fetchPublicAuctionPlayerData();
}
