import tensorflow as tf
import flwr as fl
import keras
import sklearn
import time
import sys
import json

from sklearn.preprocessing import StandardScaler

# from sklearn.model_selection import train_test_split

import pandas as pd

# from flwr_datasets.partitioner import IidPartitioner
from datasets import load_dataset

from keras import layers


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
    

model.load_weights(sys.argv[2])
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
    # metrics=[keras.metrics.Recall()]
)

def load_data_script(val):
    data_files =  val # Add all partition file paths here

    # Load all partitions as a single dataset object
    dataset = load_dataset("csv", data_files=data_files)

    # print(dataset)
    
    # Convert the partition data to a DataFrame
    data = pd.DataFrame(dataset["train"])
    # print(data.columns)

    # Ensure the 'Class' column is present
    if "Class" not in data.columns:
        raise ValueError("The 'Class' column is missing from the dataset!")

    # Separate features and labels
    features = data.drop(columns=["Class", "Time"]).values  # Exclude 'Class' and 'Time' columns
    labels = data["Class"].values

    # # Normalize features using StandardScaler
    scaler = StandardScaler()
    features = scaler.fit_transform(features)

    return data, features,labels
    # Split data into training and testing sets (80% train, 20% test)
    # x_train, x_test, y_train, y_test = train_test_split(
    #     features, labels, test_size=0.01, random_state=42
    # )

    # return x_train, y_train, x_test, y_test

def predictData(val):
    # x_train, y_train, x_test, y_test = load_data_script(val)
    data, x_all, y_all = load_data_script(val) 
    fraudcount = 0
    fraudIds = []
    nonFraudIds = []
    notfraudcount = 0
    # print(len(x_all))
    for i in range(len(x_all)):
        if model.predict(x_all[i].reshape(1, -1)) >= 0.5:
            # print('fraud')
            fraudcount+=1
            fraudIds.append(i)
        else:
            # print('not fraud')
            nonFraudIds.append(i)
            notfraudcount+=1

    return {"fraud": fraudcount, "not-fraud": notfraudcount , "fraudIds" : fraudIds, "nonFraudIds" : nonFraudIds}

try:
    result = predictData(sys.argv[1])
    print(json.dumps(result))
except:
  print('false')
