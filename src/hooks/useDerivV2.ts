/**
 * useDerivV2 — Bridge hook for @deriv/api-v2 hooks
 *
 * Re-exports all commonly used hooks from the @deriv/api-v2 package.
 * Import from this file for a single, consistent entry point.
 *
 * @example
 * import { useAuthorize, useBalance, useServerTime } from '@/hooks/useDerivV2';
 *
 * const MyComponent = () => {
 *     const { data: authData, isLoading } = useAuthorize();
 *     const { data: balanceData } = useBalance();
 *     ...
 * };
 */

export {
    useAuthorize,
    useBalance,
    useServerTime,
    useSubscription,
    useInvalidateQuery,
    usePaginatedFetch,
    useQuery,
    useMutation,
    useRemoteConfig,
    APIProvider,
    AuthProvider,
} from '@deriv/api-v2';
