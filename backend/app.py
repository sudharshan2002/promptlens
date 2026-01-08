from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    prompt = data.get("prompt", "")

    words = prompt.lower().split()
    explanations = []

    if "cyberpunk" in words or "neon" in words:
        explanations.append({
            "prompt_part": "cyberpunk",
            "effect": "Defines a futuristic, neon-lit visual style"
        })

    if "rainy" in words or "rain" in words:
        explanations.append({
            "prompt_part": "rainy",
            "effect": "Adds mood, reflections, and atmosphere"
        })

    if "night" in words or "midnight" in words:
        explanations.append({
            "prompt_part": "night",
            "effect": "Sets low-light conditions and dramatic contrast"
        })

    if "street" in words or "city" in words:
        explanations.append({
            "prompt_part": "street",
            "effect": "Specifies the urban environment"
        })

    if not explanations:
        explanations.append({
            "prompt_part": prompt.split()[0] if prompt else "",
            "effect": "General prompt component"
        })

    response = {
        "generated_text": (
            "A cinematic scene depicting "
            f"{prompt}. Neon lights reflect off wet surfaces, "
            "creating a moody, atmospheric cyberpunk aesthetic."
        ),
        "explanations": explanations,
        "segments": [
            {
                "type": "Style",
                "value": "Dark cyberpunk city"
            },
            {
                "type": "Subject",
                "value": "Girl with neon umbrella"
            }
        ]
    }

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
