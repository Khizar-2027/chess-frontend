import { useEffect, useRef } from "react";
import styles from "../../pages/Game.module.css";

function MoveHistory({ moves }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [moves]);

    const movePairs = [];
    for (let i = 0; i < moves.length; i += 2) {
        movePairs.push({
            num: Math.floor(i / 2) + 1,
            white: moves[i],
            black: moves[i + 1],
        });
    }

    return (
        <div>
            <p className={styles.movesLabel}>Moves</p>
            {movePairs.map((pair) => (
                <div key={pair.num} className={styles.moveRow}>
                    <span className={styles.moveNum}>{pair.num}.</span>
                    <span className={styles.moveWhite}>{pair.white?.san}</span>
                    <span className={styles.moveBlack}>{pair.black?.san || ""}</span>
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
}

export default MoveHistory;