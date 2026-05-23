from app.agents.budget_agent import get_spending_summary
from app.agents.productivity_agent import get_productivity_summary
from app.agents.subscription_agent import get_subscription_summary
import os

def get_agent_response(query: str, history: list, user_id: str) -> str:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        # Fallback intelligent demo response
        spending = get_spending_summary(user_id)
        productivity = get_productivity_summary(user_id)
        subs = get_subscription_summary(user_id)
        return f"**Demo Mode**: The Gemini API key is not set. However, I can still analyze your local data!\n\n**Spending**: {spending}\n**Productivity**: {productivity}\n**Subscriptions**: {subs}\n\n*To enable the full reasoning engine, please set GOOGLE_API_KEY in the `ai-services/.env` file.*"
    
    # Defer imports to prevent module load errors on mismatched LangChain versions
    from langchain_core.tools import tool
    from langchain_google_genai import ChatGoogleGenerativeAI
    import langchain.agents
    
    @tool
    def get_user_spending(uid: str) -> str:
        """Gets the total spending and top spending category for the user."""
        return get_spending_summary(uid)

    @tool
    def get_user_productivity(uid: str) -> str:
        """Gets the average work hours, sleep hours, and meetings for the user."""
        return get_productivity_summary(uid)

    @tool
    def get_user_subscriptions(uid: str) -> str:
        """Gets the active subscriptions and total monthly cost for the user."""
        return get_subscription_summary(uid)

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)
    tools = [get_user_spending, get_user_productivity, get_user_subscriptions]
    
    try:
        agent_executor = langchain.agents.initialize_agent(
            tools,
            llm,
            agent=langchain.agents.AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True
        )
        input_str = f"The user ID is {user_id}. Their query is: {query}. Fetch data using the appropriate tools."
        result = agent_executor.run(input_str)
        return result
    except Exception as e:
        return f"Agent Error: {str(e)}"
