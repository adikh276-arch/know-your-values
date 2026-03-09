import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    userId: string | null;
    isAuthResolved: boolean;
}

const AuthContext = createContext<AuthContextType>({
    userId: null,
    isAuthResolved: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(sessionStorage.getItem("user_id"));
    const [isAuthResolved, setIsAuthResolved] = useState(false);

    useEffect(() => {
        const handleAuth = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");

            if (token) {
                try {
                    const response = await fetch("https://api.mantracare.com/user/user-info", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.user_id) {
                            const uid = data.user_id.toString();
                            sessionStorage.setItem("user_id", uid);

                            // Initialize user in DB
                            try {
                                const { sql } = await import("@/lib/db");
                                await sql("INSERT INTO users (id) VALUES ($1) ON CONFLICT (id) DO NOTHING", [uid]);
                            } catch (dbErr) {
                                console.error("Failed to init user in DB:", dbErr);
                            }

                            setUserId(uid);
                            // Remove token from URL
                            const newUrl = window.location.pathname + window.location.search.replace(/[?&]token=[^&]+/, '').replace(/^&/, '?');
                            window.history.replaceState({}, "", newUrl);
                        } else {
                            window.location.href = "/token";
                        }
                    } else {
                        window.location.href = "/token";
                    }
                } catch (error) {
                    console.error("Auth error:", error);
                    window.location.href = "/token";
                }
            } else if (!userId) {
                window.location.href = "/token";
            }

            setIsAuthResolved(true);
        };

        handleAuth();
    }, [userId]);

    return (
        <AuthContext.Provider value={{ userId, isAuthResolved }}>
            {isAuthResolved ? children : (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            )}
        </AuthContext.Provider>
    );
};
