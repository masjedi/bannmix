const HomeMediaFallback = ({
    label = "BanMix Majoon",
    hint = "",
    className = "",
}) => (
    <div
        className={["home-media-fallback", className].join(" ")}
        aria-hidden="true"
    >
        <p className="home-media-fallback-mark">BanMix</p>
        <p className="home-media-fallback-label">{label}</p>
        {hint ? <p className="home-media-fallback-hint">{hint}</p> : null}
    </div>
);

export default HomeMediaFallback;
