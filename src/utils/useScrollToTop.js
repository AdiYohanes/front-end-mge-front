import { useEffect } from 'react';
import { useLocation } from 'react-router';

const useScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top when pathname changes
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // Use 'instant' for immediate scroll without animation
        });
    }, [pathname]);
};

export default useScrollToTop;
