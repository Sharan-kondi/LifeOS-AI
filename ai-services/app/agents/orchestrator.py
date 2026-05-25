from app.agents.budget_agent import get_spending_summary
from app.agents.productivity_agent import get_productivity_summary
from app.agents.subscription_agent import get_subscription_summary
import os


def get_agent_response(query: str, history: list, user_id: str) -> str:
    """Multi-agent orchestrator that uses Gemini for reasoning when available."""
    api_key = os.getenv("GOOGLE_API_KEY")

    # Always fetch local data first
    spending = get_spending_summary(user_id)
    productivity = get_productivity_summary(user_id)
    subs = get_subscription_summary(user_id)

    if not api_key:
        return (
            f"**Demo Mode**: The Gemini API key is not set. "
            f"However, I can still analyze your local data!\n\n"
            f"**Spending**: {spending}\n"
            f"**Productivity**: {productivity}\n"
            f"**Subscriptions**: {subs}\n\n"
            f"*To enable the full reasoning engine, please set "
            f"GOOGLE_API_KEY in the `ai-services/.env` file.*"
        )

    # Use google-genai SDK directly for Gemini reasoning
    try:
        from google import genai

        client = genai.Client(api_key=api_key)

        system_prompt = (
            "You are the LifeOS AI Assistant, an autonomous financial and "
            "productivity copilot. You have access to the following data about "
            "the current user. Use it to answer their question with actionable, "
            "well-formatted advice using Markdown.\n\n"
            f"## User Financial Data\n"
            f"- **Spending Summary**: {spending}\n"
            f"- **Productivity Summary**: {productivity}\n"
            f"- **Subscription Summary**: {subs}\n"
        )

        messages = [{"role": "user", "parts": [{"text": system_prompt + "\n\nUser query: " + query}]}]

        # Add history if present
        for msg in history:
            role = "user" if msg.get("role") == "user" else "model"
            messages.append({"role": role, "parts": [{"text": msg.get("content", "")}]})

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=messages,
        )

        return response.text

    except Exception as e:
        # Fallback to local data if Gemini fails
        return (
            f"*Gemini encountered an error: {str(e)}*\n\n"
            f"Here is your data from local analysis:\n\n"
            f"**Spending**: {spending}\n"
            f"**Productivity**: {productivity}\n"
            f"**Subscriptions**: {subs}"
        )
