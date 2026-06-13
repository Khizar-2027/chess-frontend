import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

import styles from "./Login.module.css";

function Login() {
    // State for form inputs
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();  // stops page from refreshing
        setError("");         // clear previous errors
        try {
            const response = await api.post("/api/auth/login/", {
                username,
                password,
            });
            login(response.data.access, username);
            navigate("/dashboard");

        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h2 className={styles.title}>♟ Chess Platform</h2>
                <h3 className={styles.subtitle}>Login</h3>

                {error && <p className={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Username"
                        value={username}    
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className={styles.input}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className={styles.button} type="submit">
                        Login
                    </button>
                </form>

                <p className={styles.link}>
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;