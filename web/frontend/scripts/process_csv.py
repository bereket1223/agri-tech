import sys
import json
import pandas as pd
import numpy as np
from collections import Counter

def process_csv(file_path):
    try:
        # Read CSV file
        df = pd.read_csv(file_path)
        
        # Validate required columns
        required_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        for col in required_columns:
            if col not in df.columns:
                return {
                    "error": f"Missing required column: {col}",
                    "message": "CSV file must contain all required columns: N, P, K, temperature, humidity, ph, rainfall"
                }
        
        # Process each row for prediction
        predictions = []
        for _, row in df.iterrows():
            # Simple logic based on the input values
            n, p, k = row['N'], row['P'], row['K']
            temp, humidity = row['temperature'], row['humidity']
            ph, rainfall = row['ph'], row['rainfall']
            
            if n > 80 and p > 40 and k > 40:
                crop = "Rice"
            elif n > 60 and temp > 20:
                crop = "Maize"
            elif ph < 6:
                crop = "Cotton"
            else:
                crop = "Chickpea"
            
            predictions.append(crop)
        
        # Count occurrences of each crop
        crop_counts = Counter(predictions)
        total_samples = len(predictions)
        
        # Calculate percentages
        crop_percentages = {crop: round((count / total_samples) * 100) for crop, count in crop_counts.items()}
        
        return {
            "totalSamples": total_samples,
            "recommendations": crop_counts,
            "percentages": crop_percentages,
            "message": f"Bulk analysis complete. {total_samples} samples processed."
        }
    
    except Exception as e:
        return {
            "error": str(e),
            "message": "An error occurred while processing the CSV file."
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Invalid arguments", "message": "Usage: python process_csv.py <csv_file>"}))
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    try:
        result = process_csv(csv_file)
        print(json.dumps(result))
    
    except Exception as e:
        print(json.dumps({"error": str(e), "message": "Failed to process CSV file."}))
        sys.exit(1)

