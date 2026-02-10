import sys
import json
import os

# Suppress TF logs so they don't mess up stdout JSON
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

try:
    import tensorflow as tf
    import numpy as np

    def run_prediction():
        # Get input from command line arguments
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No input data provided"}))
            return

        # List of numbers
        input_data = json.loads(sys.argv[1])
        
        # Load Model
        model_path = os.path.join(os.getcwd(), 'python/pim_classifier.keras')
        model = tf.keras.models.load_model(model_path)

        # Process Input
        input_tensor = np.array([[input_data]], dtype=np.float32)

        # Predict
        prediction = model.predict(input_tensor, verbose=0)

        # Output result as JSON to stdout
        print(json.dumps({"prediction": prediction.tolist()}))

    if __name__ == "__main__":
        run_prediction()

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)