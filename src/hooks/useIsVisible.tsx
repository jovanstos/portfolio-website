import { useEffect, useRef, useState } from "react";

// Custom hook that is used for the  FadeInSection component
// This checks if the content is visible on the users screen or not so that it can be faded in
const useIsVisible = (options: object) => {
    const ref = useRef<HTMLDivElement | null>(null);;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [options]);

    return { ref, isVisible };
};

export default useIsVisible;