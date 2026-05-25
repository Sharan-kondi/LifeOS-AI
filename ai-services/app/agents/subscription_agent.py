import pandas as pd
import os

def get_subscription_summary(user_id: str) -> str:
    """Returns a summary of the user's active subscriptions."""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), "../../../datasets/exports/subscriptions.csv")
        df = pd.read_csv(csv_path)
        user_df = df[(df['user_id'] == user_id) & (df['active'] == True)]
        if user_df.empty:
            return "No active subscriptions found for this user."
        
        total_monthly = user_df['monthly_cost'].sum()
        count = len(user_df)
        
        return f"You have {count} active subscriptions costing a total of ₹{total_monthly:,.2f} per month."
    except Exception as e:
        return f"Error retrieving subscriptions: {e}"
