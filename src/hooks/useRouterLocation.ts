import { useLocation, Location } from 'react-router-dom';

export function useRouterLocation(): Location | { pathname: string } {
    try {
        return useLocation();
    } catch {
        return { pathname: '/' };
    }
}