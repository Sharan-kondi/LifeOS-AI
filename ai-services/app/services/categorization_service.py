from app.models.model_loader import model

def predict_category(description: str):

    prediction = model.predict([description])[0]

    return prediction