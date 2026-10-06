import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { resetPassword } from "../../api/authApi";
import BrandLogo from "../../components/BrandLogo";
import ThemeToggle from "../../components/public/ThemeToggle";
import { PublicPage } from "../../components/public/ui";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const linkValid = useMemo(
        () => Boolean(token.trim() && email.trim()),
        [token, email]
    );

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setFieldErrors({});
        setMessage("");
        setLoading(true);

        try {
            const response = await resetPassword({
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            setMessage(
                response?.data?.message ||
                    "Your password has been reset. You can sign in now."
            );

            window.setTimeout(() => {
                navigate("/admin/login", { replace: true });
            }, 2500);
        } catch (err) {
            const validation = err.response?.data?.errors;
            if (validation && typeof validation === "object") {
                const mapped = {};
                Object.entries(validation).forEach(([key, messages]) => {
                    mapped[key] = Array.isArray(messages)
                        ? messages[0]
                        : String(messages);
                });
                setFieldErrors(mapped);
            } else {
                setError(
                    err.response?.data?.message ||
                        "Unable to reset your password. The link may have expired."
                );
            }
        } finally {
            setLoading(false);
        }
    };

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

                <h1 className="page-title text-content">Set a new password</h1>
                <p className="page-subtitle dark:text-content-muted">
                    You opened the reset link from your email. Choose a strong
                    password (12+ characters with upper, lower, number, and
                    symbol), then sign in with your admin email below.
                </p>

                {!linkValid ? (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        This reset link is invalid or incomplete. Request a new
                        link from the login page.
                    </div>
                ) : null}

                {error ? (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        {error}
                    </div>
                ) : null}

                {message ? (
                    <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                        {message}
                    </div>
                ) : null}

                <form onSubmit={submit} className="mt-6">
                    <label htmlFor="reset-email">Admin login email</label>
                    <input
                        id="reset-email"
                        type="email"
                        name="email"
                        value={email}
                        readOnly
                        className="opacity-80"
                        aria-describedby="reset-email-hint"
                    />
                    <p
                        id="reset-email-hint"
                        className="mt-1 text-xs text-content-muted"
                    >
                        This is your dashboard login address (not the inbox
                        where the link was sent).
                    </p>

                    <label htmlFor="reset-password">New password</label>
                    <input
                        id="reset-password"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                        disabled={!linkValid}
                    />
                    {fieldErrors.password ? (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                            {fieldErrors.password}
                        </p>
                    ) : null}

                    <label htmlFor="reset-password-confirm">
                        Confirm password
                    </label>
                    <input
                        id="reset-password-confirm"
                        type="password"
                        name="password_confirmation"
                        value={passwordConfirmation}
                        onChange={(event) =>
                            setPasswordConfirmation(event.target.value)
                        }
                        autoComplete="new-password"
                        required
                        disabled={!linkValid}
                    />

                    <button
                        type="submit"
                        className="btn-primary mt-2 w-full"
                        disabled={loading || !linkValid}
                    >
                        {loading ? "Saving…" : "Update password"}
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

export default ResetPassword;
