import logo from "../assets/Logo.png";

const BrandLogo = ({ className = "", mark = false }) => {
    if (mark) {
        return (
            <span
                className={`inline-flex shrink-0 overflow-hidden ${className}`}
                aria-hidden="true"
            >
                <img
                    src={logo}
                    alt=""
                    className="h-full w-auto max-w-none object-contain object-left"
                />
            </span>
        );
    }

    return (
        <img
            src={logo}
            alt="BanMix"
            className={`block h-auto object-contain ${className}`}
        />
    );
};

export default BrandLogo;
