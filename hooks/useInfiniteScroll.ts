import { useState, useCallback } from 'react';

export const useInfiniteScroll = (fetchFunction: (page: number) => Promise<any[]>) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = useCallback(() => {
    if (hasMore) {
      fetchFunction(page).then((data: any[]) => {
        setPage(prev => prev + 1);
        setHasMore(data.length > 0);
      });
    }
  }, [page, hasMore, fetchFunction]);
  
  return { loadMore, hasMore };
};
