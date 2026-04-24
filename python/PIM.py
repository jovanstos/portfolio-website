import sys
import json
import os

# Suppress TF logs so they don't mess up stdout JSON
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Update this value after retraining — PIMTrainer.py prints the optimal threshold
PREDICTION_THRESHOLD = 0.5

try:
    import tensorflow as tf
    import numpy as np

    def run_prediction():
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No input data provided"}))
            return

        # List of lists: [[week1_features...], [week2_features...], ...]
        input_data = json.loads(sys.argv[1])

        # Use __file__ so path works regardless of where Node server is launched from
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'pim_classifier.keras')
        model = tf.keras.models.load_model(model_path)

        # Reshape to [1, N, 8] — batch=1, N=weeks of history, 8 features
        input_tensor = np.array([input_data], dtype=np.float32)

        prediction = model.predict(input_tensor, verbose=0)
        print(json.dumps({"prediction": prediction.tolist()}))

    if __name__ == "__main__":
        run_prediction()

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
