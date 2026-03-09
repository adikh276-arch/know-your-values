import React from "react";
import { useAuth } from "./AuthContext";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userId, isAuthResolved } = useAuth();

    if (!isAuthResolved) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!userId) {
        // Should have been handled in AuthProvider, but as a secondary guard:
        window.location.href = "https://mantracare.com/token";
        return null;
    }

    return <>{children}</>;
};
