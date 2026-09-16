import AppRoutes from "./router/AppRoutes";
import { AuthProvider } from "./auth/AuthContext";

const App = () => {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
};

export default App;
