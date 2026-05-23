"""Categorization service — prediction logic."""
import numpy as np
from typing import List, Tuple
from app.models.model_registry import registry


def predict_category(description: str) -> Tuple[str, float]:
    """Predict category with confidence score."""
    model = registry.get("categorizer")
    if model is None:
        return "Others", 0.0

    prediction = model.predict([description])[0]
    probabilities = model.predict_proba([description])[0]
    confidence = float(np.max(probabilities))

    # If we have a label encoder, decode
    encoder = registry.get("category_label_encoder")
    if encoder is not None:
        try:
            category = encoder.inverse_transform([prediction])[0]
        except (ValueError, IndexError):
            category = str(prediction)
    else:
        category = str(prediction)

    return category, confidence


def predict_batch(descriptions: List[str]) -> List[Tuple[str, float]]:
    """Predict categories for multiple descriptions."""
    model = registry.get("categorizer")
    if model is None:
        return [("Others", 0.0)] * len(descriptions)

    predictions = model.predict(descriptions)
    probabilities = model.predict_proba(descriptions)
    confidences = np.max(probabilities, axis=1)

    encoder = registry.get("category_label_encoder")
    results = []
    for pred, conf in zip(predictions, confidences):
        if encoder is not None:
            try:
                cat = encoder.inverse_transform([pred])[0]
            except (ValueError, IndexError):
                cat = str(pred)
        else:
            cat = str(pred)
        results.append((cat, float(conf)))

    return results