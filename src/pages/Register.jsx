import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

import styles from "./Register.module.css";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await api.post("/api/auth/register/", {
                username,
                email,
                password,
            });

            setSuccess("Account created! Redirecting...");
            setTimeout(() => navigate("/login"), 1500);

        } catch (err) {
            setError("Registration failed. Try a different username.");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h2 className={styles.title}>♟ Chess Platform</h2>
                <h3 className={styles.subtitle}>Register</h3>

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

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
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className={styles.input}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className={styles.button} type="submit">
                        Create Account
                    </button>
                </form>

                <p className={styles.link}>
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;