import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import styles from "./Dashboard.module.css";

function Dashboard() {
    const [waitingGames, setWaitingGames] = useState([]);
    const [myGames, setMyGames] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const { logout, username } = useAuth();
    const [finishedGames, setFinishedGames] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [waitingRes, myRes, finishedRes] = await Promise.all([
                api.get("/api/games/"),
                api.get("/api/games/my/"),
                api.get("/api/games/finished/"),
            ]);

            setWaitingGames(waitingRes.data);
            setMyGames(myRes.data);
            setFinishedGames(finishedRes.data);
            setError("");
        } catch (err) {
            setError("Failed to load games");
        } finally {
            setLoading(false);
        }
    };

    const createGame = async () => {
        try {
            const response = await api.post("/api/games/create/");
            navigate(`/game/${response.data.id}`);
        } catch (err) {
            setError("Failed to create game");
        }
    };

    const joinGame = async (gameId) => {
        try {
            await api.patch(`/api/games/join/${gameId}/`);
            navigate(`/game/${gameId}`);
        } catch (err) {
            setError("Failed to join game");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getOpponentName = (game) => {
        if (game.white_player_username === username) {
            return game.black_player_username;
        }

        return game.white_player_username;
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Chess Platform</h1>
                        {username && (
                            <p className={styles.welcome}>Welcome back, {username}</p>
                        )}
                    </div>

                    <div className={styles.headerRight}>
                        <button className={styles.refreshBtn} onClick={fetchAll}>
                            Refresh
                        </button>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                <div className={styles.statsBar}>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>
                            {myGames.length}
                        </span>
                        <span className={styles.statLabel}>
                            Active Games
                        </span>
                    </div>

                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>
                            {waitingGames.length}
                        </span>
                        <span className={styles.statLabel}>
                            Open Games
                        </span>
                    </div>
                </div>

                {/* Create Game Button */}
                <button className={styles.createBtn} onClick={createGame}>
                    + Create New Game
                </button>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className={styles.loading}>Loading games...</p>
                ) : (
                    <>
                        {/* My Active Games */}
                        {myGames.length > 0 && (
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>🎮 Your Active Games</h2>
                                {myGames.map((game) => (
                                    <div key={game.id} className={styles.gameCard}>
                                        <div className={styles.gameInfo}>
                                            <span className={styles.gameId}>
                                                {getOpponentName(game)}
                                            </span>

                                            <span className={styles.gameStatus}>
                                                Playing as {
                                                    game.white_player_username === username
                                                        ? "White"
                                                        : "Black"
                                                }
                                            </span>

                                            <span className={styles.turnText}>
                                                {game.current_turn === (
                                                    game.white_player_username === username
                                                        ? "white"
                                                        : "black"
                                                )
                                                    ? "Your Turn"
                                                    : "Opponent's Turn"}
                                            </span>

                                            <span className={styles.turnText}>
                                                {game.current_turn}
                                            </span>
                                        </div>

                                        <button
                                            className={styles.resumeBtn}
                                            onClick={() => navigate(`/game/${game.id}`)}
                                        >
                                            Resume
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Available Games */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>🔍 Available Games</h2>
                            {waitingGames.length === 0 ? (
                                <p className={styles.noGames}>No games available. Create one!</p>
                            ) : (
                                waitingGames.map((game) => (
                                    <div key={game.id} className={styles.gameCard}>
                                        <div className={styles.gameInfo}>
                                            <span className={styles.gameId}>Game #{game.id}</span>
                                            <span className={styles.gameStatus}>
                                                Created by {game.white_player_username}
                                            </span>
                                        </div>
                                        <button
                                            className={styles.joinBtn}
                                            onClick={() => joinGame(game.id)}
                                        >
                                            Join
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        {/* Recent Games */}
                        {finishedGames.length > 0 && (
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>📋 Recent Games</h2>
                                {finishedGames.map((game) => {
                                    const iWasWhite = game.white_player_username === username;
                                    const myColor = iWasWhite ? "white" : "black";
                                    const opponent = iWasWhite
                                        ? game.black_player_username
                                        : game.white_player_username;

                                    const isDraw = game.winner === null && game.end_reason !== null;
                                    const iWon = game.winner === myColor;

                                    const resultLabel = isDraw
                                        ? "Draw"
                                        : iWon
                                        ? "Won"
                                        : "Lost";

                                    const reasonLabel = {
                                        checkmate: "by Checkmate",
                                        resignation: "by Resignation",
                                        timeout: "on Time",
                                        stalemate: "— Stalemate",
                                        draw: "— Draw",
                                    }[game.end_reason] || "";

                                    return (
                                        <div key={game.id} className={styles.gameCard}>
                                            <div className={styles.gameInfo}>
                                                <span className={styles.gameId}>{opponent || "Unknown"}</span>
                                                <span className={styles.gameStatus}>
                                                    Played as {iWasWhite ? "White" : "Black"}
                                                </span>
                                            </div>
                                            <span className={`${styles.resultBadge} ${
                                                isDraw
                                                    ? styles.resultDraw
                                                    : iWon
                                                    ? styles.resultWin
                                                    : styles.resultLoss
                                            }`}>
                                                {resultLabel} {reasonLabel}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;