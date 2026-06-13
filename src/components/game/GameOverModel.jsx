import styles from "../../pages/Game.module.css";

function GameOverModal({ winner, myColor, endReason, onBack }) {
    const isDraw = winner === "draw";
    const didWin = !isDraw && winner === myColor;

    const reasons = {
        checkmate:   "by checkmate",
        resignation: "by resignation",
        timeout:     "on time",
        stalemate:   "stalemate",
        draw:        "by repetition",
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <p className={styles.modalIcon}>
                    {isDraw ? "½" : didWin ? "♛" : "♟"}
                </p>
                <p className={`${styles.modalTitle} ${isDraw ? styles.modalTitleDraw : didWin ? styles.modalTitleWin : styles.modalTitleLoss}`}>
                    {isDraw ? "Draw" : didWin ? "You won" : "You lost"}
                </p>
                <p className={styles.modalReason}>
                    {reasons[endReason] || "Game over"}
                </p>
                <button className={styles.modalBtn} onClick={onBack}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default GameOverModal;