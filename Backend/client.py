import tensorflow as tf
import flwr as fl
import keras
import sklearn
import sys

from sklearn.preprocessing import StandardScaler
import json

from sklearn.model_selection import train_test_split
from imblearn.over_sampling import BorderlineSMOTE

import pandas as pd

from datasets import load_dataset

from keras import layers

def load_data(path):
    data_files =  path 

    # Load the dataset from the path
    dataset = load_dataset("csv", data_files=data_files)
    
    # Convert the partition data to a DataFrame
    data = pd.DataFrame(dataset["train"])
    
    required_features = {"V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20",
                          "V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28", "Amount", "Class", "Time"}

    missing_features = required_features - set(data.columns)
    if missing_features:
        raise ValueError(f"Missing required features")
    # Ensure the 'Class' column is present
    if "Class" not in data.columns:
        raise ValueError("The 'Class' column is missing from the dataset!")

    # Separate features and labels and removed class and time
    features = data.drop(columns=["Class", "Time"]).values 
    labels = data["Class"].values

    # Normalize features using StandardScaler
    scaler = StandardScaler()
    features = scaler.fit_transform(features)


    # Split data into training and testing sets (80% train, 20% test)
    x_train, x_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42
    )
    smote_border = BorderlineSMOTE(random_state = 42, kind = 'borderline-2', sampling_strategy=0.5)
    X_smoteborder, y_smoteborder = smote_border.fit_resample(x_train, y_train)
    return X_smoteborder, y_smoteborder, x_test, y_test

    # return x_train, y_train, x_test, y_test


# A global variable to track the round number
current_round = 1

class FlowerClient(fl.client.NumPyClient):
    def get_parameters(self, config):
        # Return the model's current weights
        return model.get_weights()

    def fit(self, parameters, config):
        # Set the model to the latest global model's weights
        model.set_weights(parameters)

        model.fit(x_train_initial, y_train_initial, epochs=5, batch_size=32)

        # Return the updated weights and the number of data points used
        return model.get_weights(), len(x_train_initial), {}

    def evaluate(self, parameters, config):
        # Set the model to the latest global model weights
        model.set_weights(parameters)
        # print(model.evaluate)

        global current_round
        # Evaluate the model on the test set
        loss, binary_accuracy,precision, recall, auc = model.evaluate(x_test, y_test)
        if(current_round == int(sys.argv[2])):
            print(json.dumps({"binary_accuracy": binary_accuracy, "recall": recall, "precision":precision, "auc": auc}))
            model.save_weights(f"weights/global_weights_session{sys.argv[4]}.weights.h5")
        current_round +=1
        # Return the evaluation metrics
        return loss, len(x_test), {"binary_accuracy": binary_accuracy, "recall": recall, "precision":precision, "auc": auc}

x_train, y_train, x_test, y_test = load_data(sys.argv[1])

initial_data_size = len(x_train)
x_train_initial, y_train_initial = x_train[:initial_data_size], y_train[:initial_data_size]


# Define the model
model = keras.Sequential(
        [
            layers.Input(shape=(29,)),
            layers.Dense(32, activation='relu'),
            layers.Dense(64, activation='relu'),
            layers.Dense(32, activation='relu'),
            layers.Dense(1, activation='sigmoid'),
        ]
    )
if (sys.argv[5]):
    model.load_weights(sys.argv[5])
    
optimizer = keras.optimizers.Adam(0.001)
model.compile(
    optimizer=optimizer,
    loss=keras.losses.BinaryCrossentropy(),
    metrics=[
        keras.metrics.BinaryAccuracy(),
        keras.metrics.Precision(),
        keras.metrics.Recall(),
        keras.metrics.AUC(name="auc")  # Measures area under the ROC curve
    ]
)

# Start the Flower client and connect to the server
fl.client.start_numpy_client(server_address="127.0.0.1:8080", client=FlowerClient())
