import sys
import json
import numpy as np
import pickle

def load_models():
    # In a real application, these would be the actual model files
    # For demo purposes, we'll create dummy models
    class DummyModel:
        def predict(self, X):
            # Simple logic based on the input values
            n, p, k, temp, humidity, ph, rainfall = X[0]
            
            if n > 80 and p > 40 and k > 40:
                return [1]  # Rice
            elif n > 60 and temp > 20:
                return [2]  # Maize
            elif ph < 6:
                return [5]  # Cotton
            else:
                return [21]  # Chickpea
    
    class DummyScaler:
        def transform(self, X):
            return X
    
    return DummyModel(), DummyScaler(), DummyScaler()

def predict_crop(input_data):
    try:
        # Load models
        model, sc, mx = load_models()
        
        # Extract input values
        N = float(input_data['nitrogen'])
        P = float(input_data['phosphorus'])
        K = float(input_data['potassium'])
        temp = float(input_data['temperature'])
        humidity = float(input_data['humidity'])
        ph = float(input_data['ph'])
        rainfall = float(input_data['rainfall'])
        
        # Prepare input for prediction
        feature_list = [N, P, K, temp, humidity, ph, rainfall]
        single_pred = np.array(feature_list).reshape(1, -1)
        
        # Apply transformations and predict
        mx_features = mx.transform(single_pred)
        sc_mx_features = sc.transform(mx_features)
        prediction = model.predict(sc_mx_features)
        
        # Map prediction to crop name
        crop_dict = {1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 6: "Papaya", 7: "Orange",
                     8: "Apple", 9: "Muskmelon", 10: "Watermelon", 11: "Grapes", 12: "Mango", 13: "Banana",
                     14: "Pomegranate", 15: "Lentil", 16: "Blackgram", 17: "Mungbean", 18: "Mothbeans",
                     19: "Pigeonpeas", 20: "Kidneybeans", 21: "Chickpea", 22: "Coffee"}
        
        if prediction[0] in crop_dict:
            crop = crop_dict[prediction[0]]
            result = {
                "crop": crop,
                "message": f"{crop} is the best crop to be cultivated right there"
            }
        else:
            result = {
                "crop": "Unknown",
                "message": "Sorry, we could not determine the best crop to be cultivated with the provided data."
            }
        
        return result
    
    except Exception as e:
        return {
            "error": str(e),
            "message": "An error occurred during prediction."
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Invalid arguments", "message": "Usage: python predict_crop.py <input_file>"}))
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        with open(input_file, 'r') as f:
            input_data = json.load(f)
        
        result = predict_crop(input_data)
        print(json.dumps(result))
    
    except Exception as e:
        print(json.dumps({"error": str(e), "message": "Failed to process input."}))
        sys.exit(1)

