const http = require("http");

// ==================================================
// CONFIGURATION
// ==================================================

const PORT = process.env.PORT || 10000;

const DAVID_BOT_URL =
    process.env.DAVID_BOT_URL;

const HEARTBEAT_SECRET =
    process.env.HEARTBEAT_SECRET;

const HEARTBEAT_DELAY = 5000;

let lastHeartbeat = null;

// ==================================================
// SERVEUR HTTP
// ==================================================

const server = http.createServer((req, res) => {

    // ==============================================
    // HEARTBEAT REÇU
    // ==============================================

    if (req.url === "/heartbeat") {

        const authorization =
            req.headers.authorization;

        if (
            HEARTBEAT_SECRET &&
            authorization !==
            `Bearer ${HEARTBEAT_SECRET}`
        ) {

            console.log(
                "🚫 Heartbeat refusé : secret incorrect"
            );

            res.writeHead(401, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                status: "unauthorized"
            }));

            return;
        }

        lastHeartbeat = Date.now();

        console.log(
            "💓 Heartbeat reçu de DAVID DISCORD MOD"
        );

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            status: "ok",
            heartbeat: true,
            server: "DAVID-DISCORD-HEARTBEAT",
            timestamp: Date.now()
        }));

        return;
    }

    // ==============================================
    // STATUS
    // ==============================================

    if (req.url === "/") {

        res.writeHead(200, {
            "Content-Type":
                "text/plain; charset=utf-8"
        });

        res.end(
            "💓 DAVID DISCORD HEARTBEAT SERVER est en ligne !"
        );

        return;
    }

    // ==============================================
    // 404
    // ==============================================

    res.writeHead(404);

    res.end("404 - Not Found");
});

// ==================================================
// HEARTBEAT → DAVID BOT
// ==================================================

async function sendHeartbeatToBot() {

    if (!DAVID_BOT_URL) {

        console.log(
            "⚠️ DAVID_BOT_URL n'est pas configuré."
        );

        setTimeout(
            sendHeartbeatToBot,
            30000
        );

        return;
    }

    try {

        console.log(
            "💓 HEARTBEAT SERVER → DAVID MOD"
        );

        const response = await fetch(
            DAVID_BOT_URL,
            {
                headers: {
                    "Authorization":
                        `Bearer ${HEARTBEAT_SECRET || ""}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            "✅ DAVID MOD a répondu :",
            data.status
        );

        setTimeout(
            sendHeartbeatToBot,
            HEARTBEAT_DELAY
        );

    } catch (error) {

        console.error(
            "❌ DAVID MOD ne répond pas :",
            error.message
        );

        console.log(
            "🔄 Nouvelle tentative dans 30 secondes..."
        );

        setTimeout(
            sendHeartbeatToBot,
            30000
        );
    }
}

// ==================================================
// DÉMARRAGE
// ==================================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `💓 HEARTBEAT SERVER démarré`
        );

        console.log(
            `🌐 Port : ${PORT}`
        );

        setTimeout(
            sendHeartbeatToBot,
            1000
        );
    }
);
