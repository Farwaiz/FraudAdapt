import flwr as fl
import sys

def aggregate_evaluate_metrics(metrics_list):
    """Aggregate evaluation metrics received from clients."""
    num_total_samples = sum(num_samples for num_samples, _ in metrics_list)

    aggregated_metrics = {
        "binary_accuracy": 0,
        "precision": 0,
        "recall": 0,
        "auc": 0
    }

    for num_samples, metrics in metrics_list:
        aggregated_metrics["binary_accuracy"] += metrics["binary_accuracy"] * num_samples / num_total_samples
        aggregated_metrics["precision"] += metrics["precision"] * num_samples / num_total_samples
        aggregated_metrics["recall"] += metrics["recall"] * num_samples / num_total_samples
        aggregated_metrics["auc"] += metrics["auc"] * num_samples / num_total_samples

    return aggregated_metrics

class MyStrategy(fl.server.strategy.FedAvg):
    def __init__(self, evaluate_metrics_aggregation_fn=None, **kwargs):
        super().__init__(**kwargs)
        if evaluate_metrics_aggregation_fn:
            self.evaluate_metrics_aggregation_fn = evaluate_metrics_aggregation_fn

    def aggregate_fit(self, round, results, failures):
        # Aggregating the global model weights after each round
        aggregated_weights = super().aggregate_fit(round, results, failures)
                
        return aggregated_weights

# Create custom strategy
strategy = MyStrategy(
    evaluate_metrics_aggregation_fn=aggregate_evaluate_metrics,
)

fl.server.start_server(server_address="0.0.0.0:8080", config=fl.server.ServerConfig(num_rounds=int(sys.argv[1])), strategy= strategy)