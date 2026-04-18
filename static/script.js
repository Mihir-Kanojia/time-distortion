document.addEventListener("DOMContentLoaded", () => {

    let running = false;
    let startTime = 0;
    const targetTime = 10;

    const button = document.getElementById("gameButton");
    const result = document.getElementById("result");
    const circle = document.getElementById("breathCircle");
    const resetBtn = document.getElementById("resetBtn");

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

        } else {
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

                result.innerHTML = `
                    <div class="result-card">
                        <h2>${feedback}</h2>
                        <p>Your Time: ${data.actual}s</p>
                        <p>Error: ${data.error}s</p>
                        <p>Score: ${data.score}</p>
                        <p>Type: <b>${data.personality}</b></p>
                        <p>Consistency: <b>${data.consistency}</b></p>
                    </div>
                `;
            });

            running = false;
            button.innerText = "START";
            button.classList.remove("pulse");
            circle.style.display = "none";
        }
    });

});