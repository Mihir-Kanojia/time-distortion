from flask import Flask, render_template, request, jsonify

# app = Flask(__name__)
app = Flask(__name__, static_folder='static', template_folder='templates')

history = []



@app.route("/")
def home():
    return render_template("index.html")

@app.route("/reset", methods=["POST"])
def reset():
    global history
    history = []
    return {"status": "reset"}


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json

    target = data["target"]
    actual = data["actual"]

    error = actual - target
    accuracy = abs(error)

    score = max(0, round(100 - accuracy * 10))

    history.append(error)

# ----------------
    avg_error = sum(history) / len(history)
    last_error = history[-1]

    abs_avg = abs(avg_error)
    abs_last = abs(last_error)

    # Personality based on LAST attempt (feels responsive)
    if abs_last < 0.3:
        personality = "🎯 Precision Master"
    elif abs_last < 1:
        personality = "⚡ Slightly Fast" if last_error < 0 else "🧘 Slightly Slow"
    elif abs_last < 3:
        personality = "🔥 Impulsive" if last_error < 0 else "🐢 Slow Thinker"
    else:
        personality = "💥 Way Too Fast!" if last_error < 0 else "🌀 Way Too Slow!"
# ----------------
    attempts = len(history)
    if attempts == 1:
        consistency = "🧪 First attempt – keep going!"
    elif attempts == 2:
        consistency = "📈 Building your profile..."
    else:
        avg_error = sum(history) / attempts
        variance = sum((x - avg_error) ** 2 for x in history) / attempts

        if variance < 0.5:
            consistency = "🎯 Highly Consistent"
        elif variance < 2:
            consistency = "📊 Moderately Consistent"
        else:
            consistency = "🎲 Unpredictable"

    # if avg_error < 0:
    #     personality = "Impulsive"
    # else:
    #     personality = "Calm"

    response = {
    "score": score,
    "error": round(error, 2),
    "actual": round(actual, 2),
    "personality": personality,
    "consistency": consistency
}

    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
