from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from openai import OpenAI

# -------------------------
# App setup
# -------------------------
load_dotenv()

app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not found in .env")

client = OpenAI(api_key=OPENAI_API_KEY)

# -------------------------
# Health check API
# -------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "PromptLens backend"
    })

# -------------------------
# AI Generate API
# -------------------------
@app.route("/api/ai/generate", methods=["POST"])
def generate_ai():
    data = request.get_json(force=True)
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        # ---- OpenAI call ----
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI assistant that expands visual prompts "
                        "into cinematic, descriptive scenes and analyses them."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7
        )

        generated_text = response.choices[0].message.content.strip()

        # ---- Simple analysis (project-friendly) ----
        segments = [
            {"type": "Style", "value": "Cinematic / Visual"},
            {"type": "Prompt", "value": prompt}
        ]

        explanations = [
            {
                "prompt_part": "scene description",
                "effect": "Expands the prompt into a vivid visual narrative"
            }
        ]

        return jsonify({
            "choices": [
                {
                    "index": 0,
                    "text": generated_text,
                    "analysis": {
                        "segments": segments,
                        "explanations": explanations
                    }
                }
            ]
        })

    except Exception as e:
        return jsonify({
            "error": "AI generation failed",
            "details": str(e)
        }), 500

# -------------------------
# Run server
# -------------------------
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
