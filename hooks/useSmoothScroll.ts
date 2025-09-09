import { useNavigate, useLocation } from 'react-router-dom';

export const useSmoothScroll = (onLinkClick?: () => void) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === '/home';

    const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (onLinkClick) {
            onLinkClick();
        }

        if (href.startsWith('#')) {
            e.preventDefault();
            const id = href.substring(1);
            if (isHomePage) {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate(`/home${href}`);
            }
        }
    };

    return handleScrollClick;
};
