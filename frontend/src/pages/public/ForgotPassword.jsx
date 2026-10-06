import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../api/authApi";
import BrandLogo from "../../components/BrandLogo";
import ThemeToggle from "../../components/public/ThemeToggle";
import { PublicPage } from "../../components/public/ui";

const ForgotPassword = () => {
    const [message, setMessage] = useState("");
    const [emailSent, setEmailSent] = useState(null);
    const [mailConfigured, setMailConfigured] = useState(null);
    const [mailError, setMailError] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setMailError("");
        setEmailSent(null);
        setMailConfigured(null);
        setLoading(true);

        try {
            const response = await forgotPassword();
            const data = response?.data ?? {};

            setMessage(
                data.message ||
                    "If an admin account exists, a reset link has been sent to the registered recovery inbox."
            );
            setEmailSent(data.email_sent ?? null);
            setMailConfigured(data.mail_configured ?? null);
            setMailError(data.mail_error || "");
        } catch (err) {
            if (err.response?.status === 429) {
                setError(
                    "Too many attempts. Wait about 15 minutes, then try again."
                );
                return;
            }

            if (!err.response) {
                setError(
                    "Could not reach the server. Make sure the API is running, then try again."
                );
                return;
            }

            const payload = err.response?.data ?? {};
            setError(
                payload.errors?.email?.[0] ||
                    payload.message ||
                    "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const showNotice = Boolean(message);
    const noticeIsSuccess = emailSent === true;

    return (
        <PublicPage className="relative px-4">
            <div className="absolute end-4 top-4 z-10">
                <ThemeToggle />
            </div>

            <div className="auth-card mt-24">
                <Link
                    to="/"
                    className="mx-auto block w-fit"
                    aria-label="BannMix home"
                >
                    <BrandLogo className="w-[190px]" />
                </Link>

                <h1 className="page-title text-content">Forgot password</h1>
                <p className="page-subtitle dark:text-content-muted">
                    We will email a one-time reset link to the registered recovery
                    inbox. Open that link to choose a new password. This page does
                    not change your password.
                </p>

                {error ? (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        {error}
                    </div>
                ) : null}

                {showNotice ? (
                    <div
                        className={[
                            "mt-4 rounded-lg p-3 text-sm",
                            noticeIsSuccess
                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                                : "bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
                        ].join(" ")}
                    >
                        <p>{message}</p>
                        {emailSent === true ? (
                            <p className="mt-2">
                                Check your recovery inbox and spam folder, then use
                                the link in that email.
                            </p>
                        ) : null}
                        {emailSent === false && mailConfigured === false ? (
                            <p className="mt-2">
                                Add a Google App Password to{" "}
                                <code className="text-xs">MAIL_PASSWORD</code> in{" "}
                                <code className="text-xs">backend/.env</code>, run{" "}
                                <code className="text-xs">php artisan config:clear</code>
                                , then try again. Until then, reset locally with{" "}
                                <code className="text-xs">
                                    php artisan admin:issue-reset-link
                                </code>
                                .
                            </p>
                        ) : null}
                        {emailSent === false && mailConfigured === true ? (
                            <p className="mt-2">
                                Gmail rejected the send. Regenerate the App Password,
                                update <code className="text-xs">MAIL_PASSWORD</code>{" "}
                                in <code className="text-xs">backend/.env</code>, run{" "}
                                <code className="text-xs">php artisan mail:doctor --send</code>
                                , then try again.
                            </p>
                        ) : null}
                        {mailError ? (
                            <p className="mt-2 break-words text-xs opacity-90">
                                {mailError}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                <form onSubmit={submit} className="mt-6">
                    <button
                        type="submit"
                        className="btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? "Sending…" : "Email reset link"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-content-secondary">
                    <Link
                        to="/admin/login"
                        className="font-semibold text-theme-link hover:text-theme-link-hover"
                    >
                        Back to login
                    </Link>
                </p>
            </div>
        </PublicPage>
    );
};

export default ForgotPassword;
