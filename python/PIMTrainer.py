# WARNING, these are NOT installed in production since this script is only used when deving
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.utils.class_weight import compute_class_weight

# Config variables
CSV_FILE = 'PIM_training_data.csv'
MODEL_SAVE_NAME = 'pim_classifier.keras'
LOOKBACK_WINDOW = 10
TEST_SIZE = 0.2
WEEKS_PER_STOCK = 26  # CRITICAL: The cycle length of the game data

# Features required by the prompt
FEATURE_COLS = ['globalNews', 'companyNews', 'volume', 'volatility', 'pOverE', 'socialBuzz', 'momentum', 'isEarningsWeek']
SOURCE_TARGET_COL = 'priceChange'

def load_and_process_data_chunks(filepath, lookback=10, weeks_per_stock=26):
    df = pd.read_csv(filepath)

    # Ensure the 26-week chunking
    num_full_stocks = len(df) // weeks_per_stock
    df = df.iloc[:num_full_stocks * weeks_per_stock]

    data_values = df[FEATURE_COLS + [SOURCE_TARGET_COL]].values

    X, y = [], []

    # Loop through each stock individually
    for stock_idx in range(num_full_stocks):
        start_row = stock_idx * weeks_per_stock
        end_row = start_row + weeks_per_stock

        # Extract just this one stock's 26 weeks
        stock_chunk = data_values[start_row:end_row]

        # Create sequences WITHIN this chunk only
        for i in range(lookback, weeks_per_stock):
            # Features: previous 'lookback' weeks
            X.append(stock_chunk[i-lookback:i, :-1])

            # Target: Determine Direction 1 for Up, 0 for Down/Flat
            actual_price_change = stock_chunk[i, -1]
            direction = 1 if actual_price_change > 0 else 0
            y.append(direction)

    return np.array(X), np.array(y)

X, y = load_and_process_data_chunks(CSV_FILE, LOOKBACK_WINDOW, WEEKS_PER_STOCK)

print(f"Input Shape (Samples, TimeSteps, Features): {X.shape}")

# Print class distribution so we can see the imbalance clearly
class_counts = np.bincount(y)
print(f"\nClass distribution:")
print(f"  Down (0): {class_counts[0]} samples ({class_counts[0]/len(y)*100:.1f}%)")
print(f"  Up   (1): {class_counts[1]} samples ({class_counts[1]/len(y)*100:.1f}%)")
print(f"  Ratio: {class_counts[0]/class_counts[1]:.2f}:1 (Down:Up)")

# Split into Train and Test sets
# shuffle=False is important for time-series data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=TEST_SIZE, shuffle=False)

# Compute class weights to counter the imbalance — penalizes mistakes on the minority class equally
raw_class_weights = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
class_weight_dict = {i: float(raw_class_weights[i]) for i in range(len(raw_class_weights))}
print(f"\nClass weights applied: {class_weight_dict}")

# Stacked LSTM: first layer captures short-term patterns, second captures longer-term context
model = Sequential()
model.add(LSTM(units=128, return_sequences=True, input_shape=(X_train.shape[1], X_train.shape[2])))
model.add(Dropout(0.3))
model.add(LSTM(units=64, return_sequences=False))
model.add(Dropout(0.2))
model.add(Dense(units=32, activation='relu'))
model.add(Dropout(0.2))
model.add(Dense(units=1, activation='sigmoid'))

# Compile
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Training
print("\nStarting training...")

callback = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)

history = model.fit(
    X_train, y_train,
    epochs=32,
    batch_size=26,
    validation_data=(X_test, y_test),
    class_weight=class_weight_dict,
    verbose=1,
    callbacks=[callback]
)

# Evaluate the performance
print("\nEvaluating Model Performance...")

predictions_prob = model.predict(X_test)

# Find the threshold that maximizes F1-score instead of hardcoding 0.5
thresholds = np.arange(0.3, 0.71, 0.01)
best_threshold = 0.5
best_f1 = 0.0

for t in thresholds:
    preds = (predictions_prob > t).astype(int)
    score = f1_score(y_test, preds, zero_division=0)
    if score > best_f1:
        best_f1 = score
        best_threshold = float(t)

predictions_binary = (predictions_prob > best_threshold).astype(int)
accuracy = np.mean(predictions_binary.flatten() == y_test)

print("------------------------------------------------")
print(f"DIRECTIONAL ACCURACY: {accuracy * 100:.2f}%")
print(f"OPTIMAL THRESHOLD:    {best_threshold:.2f}  (F1: {best_f1:.4f})")
print("------------------------------------------------")
print("Confusion Matrix:")
print(confusion_matrix(y_test, predictions_binary))
print("\nDetailed Report:")
print(classification_report(y_test, predictions_binary, target_names=['Down', 'Up']))
print("------------------------------------------------")
print(f"\n>>> Update PREDICTION_THRESHOLD in PIM.py to: {best_threshold:.2f}")

model.save(MODEL_SAVE_NAME)
