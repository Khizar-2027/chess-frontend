import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

function parseUsername(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.user_id || null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("access_token"));
    const [username, setUsername] = useState(
        localStorage.getItem("username") || ""
    );

    const login = (accessToken, user) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("username", user);
        setToken(accessToken);
        setUsername(user);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        setToken(null);
        setUsername("");
    };

    return (
        <AuthContext.Provider value={{ token, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}