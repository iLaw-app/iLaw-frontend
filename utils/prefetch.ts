import { cacheGet, cacheSet } from './cache';

const API_BASE = 'https://ilaw-backend.up.railway.app';

function mapPoll(poll: any) {
  if (!poll?.options) return undefined;
  const options = poll.options;
  return { options, total: options.reduce((s: number, o: any) => s + o.votes, 0) };
}

export function prefetchAll(accessToken?: string | null) {
  const authOpts = (need: boolean): RequestInit | undefined =>
    need && accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
  const qaCacheKey = `qa-list-${accessToken ?? 'guest'}`;

  if (!cacheGet('popular-home', 300_000)) {
    fetch(`${API_BASE}/home/popular`)
      .then(r => r.json())
      .then(data => cacheSet('popular-home', Array.isArray(data) ? data : []))
      .catch(() => {});
  }

  if (!cacheGet(qaCacheKey, 30_000)) {
    fetch(`${API_BASE}/qa`, authOpts(!!accessToken))
      .then(r => r.json())
      .then(data => cacheSet(qaCacheKey, Array.isArray(data) ? data : []))
      .catch(() => {});
  }

  if (!cacheGet('community-list', 30_000)) {
    fetch(`${API_BASE}/community?limit=50`, authOpts(!!accessToken))
      .then(r => r.json())
      .then(data => {
        const list: any[] = Array.isArray(data) ? data : Array.isArray(data.posts) ? data.posts : [];
        cacheSet('community-list', list.map((p: any) => ({ ...p, poll: mapPoll(p.poll) })));
      })
      .catch(() => {});
  }
}
