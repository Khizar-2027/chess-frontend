import styles from "../../pages/Game.module.css";

function PlayerCard({ username, color, time, isActive, isGameOver }) {
    const parts = time.split(":");
    const totalSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
    const isLow = totalSeconds < 30;

    const timerClass = [
        styles.timerBox,
        isActive && !isGameOver && !isLow ? styles.timerBoxActive : "",
        isActive && !isGameOver && isLow  ? styles.timerBoxLow    : "",
    ].filter(Boolean).join(" ");

    return (
        <div className={`${styles.playerCard} ${isActive && !isGameOver ? styles.playerCardActive : ""}`}>
            <span className={`${styles.pieceIcon} ${color === "white" ? styles.pieceIconWhite : styles.pieceIconBlack}`} />
            <span className={styles.playerName}>{username}</span>
            {isActive && !isGameOver && <span className={styles.activeDot} />}
            <span className={timerClass}>{time}</span>
        </div>
    );
}

export default PlayerCard;