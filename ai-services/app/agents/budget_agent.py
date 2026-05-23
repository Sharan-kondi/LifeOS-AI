import pandas as pd
import os

def get_spending_summary(user_id: str) -> str:
    """Returns a summary of the user's spending."""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), "../../../datasets/exports/transactions.csv")
        df = pd.read_csv(csv_path)
        user_df = df[df['user_id'] == user_id]
        if user_df.empty:
            return "No transactions found for this user."
        
        total_spent = user_df['amount'].sum()
        top_category = user_df.groupby('category')['amount'].sum().idxmax()
        
        return f"Total spending: ₹{total_spent:,.2f}. Top spending category: {top_category}."
    except Exception as e:
        return f"Error retrieving spending: {e}"
