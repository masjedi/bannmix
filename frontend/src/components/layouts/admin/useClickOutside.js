import { useEffect } from "react";

const useClickOutside = (ref, handler, active = true) => {
    useEffect(() => {
        if (!active) {
            return undefined;
        }

        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }

            handler(event);
        };

        document.addEventListener("mousedown", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
        };
    }, [ref, handler, active]);
};

export default useClickOutside;
