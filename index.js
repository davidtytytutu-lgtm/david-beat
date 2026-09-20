const express = require("express");

const app = express();

const PORT = process.env.PORT || 10000;

const DAVID_BOT_URL =
    process.env.DAVID_BOT_URL ||
    "https://david-anti.onrender.com/heartbeat";

const HEARTBEAT_SECRET =
    process.env.HEARTBEAT_SECRET;

let heartbeatCount = 0;
let lastHeartbeat = null;

app.use(express.json());

// ============================================================
// PAGE PRINCIPALE
// ============================================================

app.get("/", (req, res) => {
    res.json({
        service: "david-beat",
        status: "online",
        heartbeatCount,
        lastHeartbeat
    });
});

// ============================================================
// RÉCEPTION HEARTBEAT DE DAVID ANTI
// ============================================================

app.post("/heartbeat", (req, res) => {

    const secret =
        req.headers["x-heartbeat-secret"];

    if (
        HEARTBEAT_SECRET &&
        secret !== HEARTBEAT_SECRET
    ) {

        console.log(
            "🚫 Heartbeat refusé : secret incorrect"
        );

        return res.status(401).json({
            status: "unauthorized"
        });
    }

    heartbeatCount++;
    lastHeartbeat = new Date().toISOString();

    console.log("");
    console.log(
        "💓 =================================="
    );
    console.log(
        "💓 HEARTBEAT REÇU DE DAVID ANTI"
    );
    console.log(
        `💓 Nombre : ${heartbeatCount}`
    );
    console.log(
        `💓 Heure : ${lastHeartbeat}`
    );
    console.log(
        "💓 =================================="
    );

    res.status(200).json({
        status: "ok",
        bot: "david-anti",
        online: true,
        heartbeat: heartbeatCount,
        timestamp: lastHeartbeat
    });
});

// ============================================================
// TEST DAVID ANTI
// ============================================================

async function checkDavidAnti() {

    console.log(
        "💓 HEARTBEAT SERVER → DAVID ANTI"
    );

    try {

        const response =
            await fetch(
                DAVID_BOT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "x-heartbeat-secret":
                            HEARTBEAT_SECRET || ""
                    },

                    body: JSON.stringify({
                        source: "david-beat",
                        timestamp:
                            new Date().toISOString()
                    })
                }
            );

        const data =
            await response.json()
                .catch(() => ({}));

        if (response.ok) {

            console.log(
                `✅ DAVID ANTI répond : HTTP ${response.status}`,
                data
            );

        } else {

            console.error(
                `❌ DAVID ANTI ne répond pas correctement : HTTP ${response.status}`,
                data
            );
        }

    } catch (error) {

        console.error(
            "❌ Impossible de contacter DAVID ANTI :",
            error.message
        );
    }
}

// ============================================================
// DÉMARRAGE
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            "💓 HEARTBEAT SERVER démarré"
        );

        console.log(
            `🌐 Port : ${PORT}`
        );

        console.log(
            `🎯 DAVID ANTI : ${DAVID_BOT_URL}`
        );

        // Premier test
        setTimeout(
            checkDavidAnti,
            5000
        );

        // Test toutes les 60 secondes
        setInterval(
            checkDavidAnti,
            60000
        );
    }
);

// ============================================================
// ERREURS
// ============================================================

process.on(
    "unhandledRejection",
    error => {

        console.error(
            "❌ Unhandled Rejection :",
            error
        );
    }
);

process.on(
    "uncaughtException",
    error => {

        console.error(
            "❌ Uncaught Exception :",
            error
        );
    }
);
