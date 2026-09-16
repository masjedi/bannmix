import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import BrandLogo from "../../components/BrandLogo";
import ThemeToggle from "../../components/public/ThemeToggle";
import { PublicPage } from "../../components/public/ui";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const updateField = (event) => {
        setForm((previous) => ({
            ...previous,
            [event.target.name]: event.target.value,
        }));
    };

    const submit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result = await login(form);
            const loggedInUser = result?.user || result;
            const role = loggedInUser?.role || loggedInUser?.type;

            if (role === "admin") {
                navigate("/admin", { replace: true });
                return;
            }

            setError("Only admin accounts can access the dashboard.");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed.");
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
                    className="mx-auto m-auto block w-fit"
                    aria-label="BanMix home"
                >
                    <BrandLogo className="w-[190px]" />
                </Link>

                <h1 className="page-title text-content">Admin Login</h1>
                <p className="page-subtitle dark:text-content-muted">
                    Sign in to manage BanMix content.
                </p>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="mt-6">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={updateField}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={updateField}
                        required
                    />

                    <button
                        type="submit"
                        className="btn-primary mt-2 w-full"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </PublicPage>
    );
};

export default Login;
