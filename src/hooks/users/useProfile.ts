import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';

export const profileKeys = {
  all: ['profile'] as const,
  me: () => ['profile', 'me'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => usersApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}