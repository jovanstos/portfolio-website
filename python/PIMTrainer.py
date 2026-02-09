# WARNING, these are NOT installed in production since this script is only used when deving
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

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
            # Take all columns except the last one which is priceChange
            X.append(stock_chunk[i-lookback:i, :-1])
            
            # Target: Determine Direction 1 for Up, 0 for Down/Flat
            actual_price_change = stock_chunk[i, -1]
            direction = 1 if actual_price_change > 0 else 0
            y.append(direction)

    return np.array(X), np.array(y)

X, y = load_and_process_data_chunks(CSV_FILE, LOOKBACK_WINDOW, WEEKS_PER_STOCK)

print(f"Input Shape (Samples, TimeSteps, Features): {X.shape}")

# Split into Train and Test sets
# shuffle=False is important for time-series visualization, 
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=TEST_SIZE, shuffle=False)

# Build the LSTM model
model = Sequential()

# LSTM Layer
model.add(LSTM(units=64, return_sequences=False, input_shape=(X_train.shape[1], X_train.shape[2])))

# Dropout to pervent overfitting 0.1 = 10%
model.add(Dropout(0.2))

# Dense Output Layer
# ACTIVATION 'sigmoid' squashes output between 0 and 1.
# < 0.5 means likely DOWN, > 0.5 means likely UP.
model.add(Dense(units=1, activation='sigmoid'))

# Compile
# Optimizer: Adam is standard
# Loss: 'binary_crossentropy' is need for Up/Down classification
# Metrics: 'accuracy' explains what % it got right
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Training
print("Starting training...")

callback = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)

history = model.fit(
    X_train, y_train,
    epochs=25, # How many times to go through the data
    batch_size=26,  # How many rows to process at once
    validation_data=(X_test, y_test),
    verbose=1,
    callbacks=[callback]
)

# Evaluate the performance
print("\nEvaluating Model Performance...")

# Get raw probabilities (e.g., 0.85, 0.12)
predictions_prob = model.predict(X_test)

# Convert to 0 or 1 based on 0.5 threshold
predictions_binary = (predictions_prob > 0.5).astype(int)

# Calculate Accuracy
accuracy = np.mean(predictions_binary.flatten() == y_test)

print("------------------------------------------------")
print(f"DIRECTIONAL ACCURACY: {accuracy * 100:.2f}%")
print("------------------------------------------------")
print("Confusion Matrix:")
print(confusion_matrix(y_test, predictions_binary))
print("\nDetailed Report:")
print(classification_report(y_test, predictions_binary, target_names=['Down', 'Up']))
print("------------------------------------------------")

model.save(MODEL_SAVE_NAME)