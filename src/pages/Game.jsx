import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Chessboard } from "react-chessboard";

import PlayerCard from "../components/game/PlayerCard";
import MoveHistory from "../components/game/MoveHistory";
import GameOverModal from "../components/game/GameOverModel";
import styles from "./Game.module.css";

function Game() {
    const { gameId } = useParams();
    const navigate = useNavigate();

    const [game, setGame] = useState(null);
    const [fen, setFen] = useState("start");
    const [moves, setMoves] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [whiteTime, setWhiteTime] = useState(600);
    const [blackTime, setBlackTime] = useState(600);
    const [winner, setWinner] = useState(null);
    const [endReason, setEndReason] = useState(null);
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [highlightedSquares, setHighlightedSquares] = useState({});
    const [lastMove, setLastMove] = useState(null);
    const [confirmResign, setConfirmResign] = useState(false);

    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const wsBase = import.meta.env.VITE_WS_BASE_URL;
        const ws = new WebSocket(
            `${wsBase}/ws/game/${gameId}/?token=${token}`
        );

        ws.onopen = () => console.log("WebSocket connected");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "game_state") {
                setFen(data.board_state);
                setWhiteTime(data.white_time);
                setBlackTime(data.black_time);
                setMoves(data.moves);
                setGame({
                    status: data.status,
                    current_turn: data.current_turn,
                    white_player_username: data.white_player_username,
                    black_player_username: data.black_player_username,
                });
            }

            if (data.type === "game_update") {
                setFen(data.board_state);
                setWhiteTime(data.white_time);
                setBlackTime(data.black_time);
                setMoves(data.moves);
                setGame((prev) => ({
                    ...prev,
                    current_turn: data.current_turn,
                    status: data.status,
                }));

                if (data.last_move) setLastMove(data.last_move);
                if (data.winner) setWinner(data.winner);
                if (data.end_reason) setEndReason(data.end_reason);

                if (data.is_checkmate) {
                    setMessage("Checkmate — game over");
                    setWinner(data.current_turn === "white" ? "black" : "white");
                    setEndReason("checkmate");
                } else if (data.is_stalemate) {
                    setMessage("Stalemate — draw");
                    setWinner("draw");
                    setEndReason(data.end_reason);
                } else if (data.is_draw) {
                    setMessage("Draw");
                    setWinner("draw");
                    setEndReason(data.end_reason);
                } else if (data.is_check) {
                    setMessage("⚠ Check!");
                } else {
                    setMessage("");
                }

            }

            if (data.type === "error") {
                setError(data.message);
            }
        };

        ws.onclose = () => console.log("WebSocket disconnected");

        socketRef.current = ws;
        return () => ws.close();
    }, [gameId]);

    useEffect(() => {
        if (!game || game.status !== "active") return;

        const interval = setInterval(() => {
            if (game.current_turn === "white") {
                setWhiteTime((prev) => (prev <= 0 ? 0 : prev - 1));
            } else {
                setBlackTime((prev) => (prev <= 0 ? 0 : prev - 1));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [game?.current_turn, game?.status]);

    const makeMove = (from, to, promotion = null) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            setError("Connection lost. Please refresh.");
            return;
        }
        setError("");
        const msg = { type: "move", move: `${from}${to}` };
        if (promotion) msg.promotion = promotion;
        socketRef.current.send(JSON.stringify(msg));
    };

    const getPieceOnSquare = (square) => {
        const fenParts = fen.split(" ")[0];
        const rows = fenParts.split("/");
        const col = square.charCodeAt(0) - "a".charCodeAt(0);
        const row = 8 - parseInt(square[1]);
        let currentCol = 0;
        for (const char of rows[row]) {
            if (isNaN(char)) {
                if (currentCol === col) {
                    return `${char === char.toUpperCase() ? "w" : "b"}${char.toUpperCase()}`;
                }
                currentCol++;
            } else {
                currentCol += parseInt(char);
            }
        }
        return null;
    };

    const onSquareClick = (square) => {
        if (isGameOver) return;
        if (game.current_turn !== myColor) return;

        if (!selectedSquare) {
            const piece = getPieceOnSquare(square);
            if (!piece) return;
            if (myColor === "white" && piece[0] !== "w") return;
            if (myColor === "black" && piece[0] !== "b") return;
            setSelectedSquare(square);
            setHighlightedSquares({ [square]: { backgroundColor: "rgba(255,255,0,0.35)" } });
            return;
        }

        if (selectedSquare === square) {
            setSelectedSquare(null);
            setHighlightedSquares({});
            return;
        }

        // detect promotion — if it is one, clear selection and do nothing
        // the user needs to drag for promotion (shows the piece picker UI)
        const movingPiece = getPieceOnSquare(selectedSquare);
        const isPromotion =
            (movingPiece === "wP" && square[1] === "8") ||
            (movingPiece === "bP" && square[1] === "1");

        if (isPromotion) {
            // can't handle via click — reset and let them drag
            setSelectedSquare(null);
            setHighlightedSquares({});
            setMessage("Drag the pawn to promote");
            setTimeout(() => setMessage(""), 2500);
            return;
        }

        makeMove(selectedSquare, square);
        setSelectedSquare(null);
        setHighlightedSquares({});
    };

    const handleResign = () => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            setError("Connection lost. Please refresh.");
            return;
        }
        socketRef.current.send(JSON.stringify({ type: "resign" }));
        setConfirmResign(false);
    };

    const onPieceDrop = (sourceSquare, targetSquare, piece) => {
        const isPromotion =
            (piece === "wP" && targetSquare[1] === "8") ||
            (piece === "bP" && targetSquare[1] === "1");
        if (isPromotion) return true;
        makeMove(sourceSquare, targetSquare);
        return true;
    };

    const onPromotionPieceSelect = (piece, from, to) => {
        makeMove(from, to, piece[1].toLowerCase());
        return true;
    };

    const formatTime = (seconds) => {
        if (seconds == null || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const currentUser = localStorage.getItem("username");
    const myColor = game?.white_player_username === currentUser ? "white" : "black";
    const isGameOver = game?.status === "finished";

    // opponent is always at the top, you at the bottom
    const topColor    = myColor === "white" ? "black" : "white";
    const bottomColor = myColor;
    const topUsername    = topColor === "white"
        ? (game?.white_player_username || "Waiting...")
        : (game?.black_player_username || "Waiting...");
    const bottomUsername = bottomColor === "white"
        ? (game?.white_player_username || "Waiting...")
        : (game?.black_player_username || "Waiting...");
    const topTime    = topColor === "white" ? formatTime(whiteTime) : formatTime(blackTime);
    const bottomTime = bottomColor === "white" ? formatTime(whiteTime) : formatTime(blackTime);

    const lastMoveStyle = lastMove ? {
        [lastMove.from]: { backgroundColor: "rgba(255,255,0,0.2)" },
        [lastMove.to]:   { backgroundColor: "rgba(255,255,0,0.2)" },
    } : {};

    if (!game) {
        return <div className={styles.loading}>Loading game...</div>;
    }

    return (
        <div className={styles.page}>

            {/* ── Nav bar ── */}
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate("/dashboard")}>
                    ← Dashboard
                </button>
                <h2 className={styles.headerTitle}>
                    ♟ Game <span>#{gameId}</span>
                </h2>
                <span className={`${styles.statusBadge} ${game.status === "active" ? styles.statusActive : styles.statusFinished}`}>
                    {game.status}
                </span>
            </header>

            {/* ── Body ── */}
            <div className={styles.layout}>

                {/* Board + player cards */}
                <div className={styles.boardColumn}>

                    {/* Opponent (top) */}
                    <PlayerCard
                        username={topUsername}
                        color={topColor}
                        time={topTime}
                        isActive={game.current_turn === topColor}
                        isGameOver={isGameOver}
                    />

                    {/* Board */}
                    <div className={styles.boardWrapper}>
                        <Chessboard
                            boardWidth={480}
                            position={fen}
                            onPieceDrop={onPieceDrop}
                            onPromotionPieceSelect={onPromotionPieceSelect}
                            onSquareClick={onSquareClick}
                            customSquareStyles={{ ...highlightedSquares, ...lastMoveStyle }}
                            boardOrientation={myColor}
                            isDraggablePiece={({ piece }) => {
                                if (isGameOver) return false;
                                if (game.current_turn !== myColor) return false;
                                if (myColor === "white" && piece[0] !== "w") return false;
                                if (myColor === "black" && piece[0] !== "b") return false;
                                return true;
                            }}
                        />
                    </div>

                    {/* You (bottom) */}
                    <PlayerCard
                        username={bottomUsername}
                        color={bottomColor}
                        time={bottomTime}
                        isActive={game.current_turn === bottomColor}
                        isGameOver={isGameOver}
                    />

                </div>

                {/* Sidebar */}
                <div className={styles.sidebar}>

                    {(message || error) && (
                        <div className={message ? styles.messageBar : styles.errorBar}>
                            {message || error}
                        </div>
                    )}

                    <div className={styles.movesCard}>
                        <MoveHistory moves={moves} />
                    </div>

                    {!isGameOver && (
                        confirmResign ? (
                            <div className={styles.resignConfirm}>
                                <span>Resign this game?</span>
                                <div className={styles.resignConfirmButtons}>
                                    <button className={styles.resignConfirmYes} onClick={handleResign}>Yes, resign</button>
                                    <button className={styles.resignConfirmNo} onClick={() => setConfirmResign(false)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <button className={styles.resignButton} onClick={() => setConfirmResign(true)}>
                                Resign
                            </button>
                        )
                    )}

                </div>

            </div>

            {/* ── Game Over Modal ── */}
            {isGameOver && (winner || winner === "draw") && (
                <GameOverModal
                    winner={winner}
                    myColor={myColor}
                    endReason={endReason}
                    onBack={() => navigate("/dashboard")}
                />
            )}

        </div>
    );
}

export default Game;