const Alert = ({ type = "error", message }) => {
    if (!message) return null;

    const classes = {
        success: "theme-alert-success",
        error: "theme-alert-danger",
        danger: "theme-alert-danger",
        info: "theme-alert-info",
        warning: "theme-alert-warning",
    };

    return (
        <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${classes[type] || classes.error}`}
            role="alert"
        >
            {message}
        </div>
    );
};

export default Alert;
