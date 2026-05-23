import pandas as pd
import os

def get_productivity_summary(user_id: str) -> str:
    """Returns a summary of the user's productivity and work hours."""
    try:
        csv_path = os.path.join(os.path.dirname(__file__), "../../../datasets/exports/productivity.csv")
        df = pd.read_csv(csv_path)
        user_df = df[df['user_id'] == user_id]
        if user_df.empty:
            return "No productivity data found for this user."
        
        avg_work_hours = user_df['work_hours'].mean()
        avg_sleep = user_df['sleep_hours'].mean()
        avg_meetings = user_df['meetings_count'].mean()
        
        return f"You average {avg_work_hours:.1f} work hours, {avg_sleep:.1f} sleep hours, and {avg_meetings:.1f} meetings per day."
    except Exception as e:
        return f"Error retrieving productivity data: {e}"
