const HomeMediaFallback = ({
    label = "BannMix PiawarryBann",
    hint = "",
    className = "",
}) => (
    <div
        className={["home-media-fallback", className].join(" ")}
        aria-hidden="true"
    >
        <p className="home-media-fallback-mark">BannMix</p>
        <p className="home-media-fallback-label">{label}</p>
        {hint ? <p className="home-media-fallback-hint">{hint}</p> : null}
    </div>
);

export default HomeMediaFallback;
