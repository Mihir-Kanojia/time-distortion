document.addEventListener("DOMContentLoaded", () => {

    let running = false;
    let startTime = 0;
    const targetTime = 10;

    const button = document.getElementById("gameButton");
    const result = document.getElementById("result");
    const circle = document.getElementById("breathCircle");
    const resetBtn = document.getElementById("resetBtn");
    const retryBtn = document.getElementById("retryBtn");
    const gameArea = document.getElementById("gameArea");


    const retryTexts = [
    "Try Again 🔁",
    "One More Time ⚡",
    "You Can Do Better 💪",
    "Beat Your Score 🚀"
    ];

    retryBtn.innerText =
    retryTexts[Math.floor(Math.random() * retryTexts.length)];

    const messages = [
        "Feel the time...",
        "Trust your instinct...",
        "Don't count... sense it...",
        "Let time flow...",
        "Stay calm..."
    ];

    function vibrate(pattern = 100) {
        if (navigator && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // ✅ RESET BUTTON SAFE CHECK
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            fetch("/reset", { method: "POST" });
            result.innerHTML = "🔄 Session reset. Start fresh!";
            vibrate(50);
        });
    }

    button.addEventListener("click", () => {

        if (!running) {
            startTime = Date.now();
            running = true;

            button.innerText = "STOP";
            button.classList.add("pulse");
            circle.style.display = "block";

            vibrate(50);

            result.innerHTML =
                messages[Math.floor(Math.random() * messages.length)];

        }else {
    const endTime = Date.now();
    const actualTime = (endTime - startTime) / 1000;

    vibrate(100);

    fetch("/analyze", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            target: targetTime,
            actual: actualTime
        })
    })
    .then(res => res.json())
    .then(data => {

        let feedback = "";
        const errorAbs = Math.abs(data.error);

        if (errorAbs < 0.3) {
            feedback = "🔥 PERFECT TIMING!";
            vibrate([100, 50, 100]);
        } else if (errorAbs < 1) {
            feedback = "⚡ Very Close!";
            vibrate(80);
        } else if (errorAbs < 3) {
            feedback = "👍 Good Try!";
            vibrate(50);
        } else {
                feedback = "😅 Way Off!";
                vibrate(30);
            }

            // ✅ Hide game UI
            gameArea.style.display = "none";

            // ✅ Show result
            result.innerHTML = `
                <div class="result-card">
                    <h2>${feedback}</h2>
                    <p>Your Time: ${data.actual}s</p>
                    <p>Error: ${data.error}s</p>
                    <p>Score: ${data.score}</p>
                    <p>🧠 Type: <b>${data.personality}</b></p>
                    ${data.consistency ? `<p>📊 ${data.consistency}</p>` : ""}
                </div>
            `;

            // ✅ Random retry text
            retryBtn.innerText =
                retryTexts[Math.floor(Math.random() * retryTexts.length)];

            // ✅ Show retry button
            retryBtn.style.display = "inline-block";
        });

        // reset UI state (but NOT result)
        running = false;
        button.innerText = "START";
        button.classList.remove("pulse");
        circle.style.display = "none";
    }
    });


    retryBtn.addEventListener("click", () => {

    // Reset UI
    gameArea.style.display = "block";
    retryBtn.style.display = "none";

    result.innerHTML = "Ready for next round? 💪";

    button.innerText = "START";
    circle.style.display = "none";
    button.classList.remove("pulse");

    running = false;
    }); 
});