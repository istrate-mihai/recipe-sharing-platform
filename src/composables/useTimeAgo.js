import { computed } from 'vue';

function formatTimeAgo(dateValue) {
  const date = new Date(dateValue)
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60)    return 'just now';
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function useTimeAgo(dateRef) {
  // computed is pure — only re-runs when dateRef.value changes, not on every render
  return computed(() => formatTimeAgo(dateRef.value ?? dateRef));
}
