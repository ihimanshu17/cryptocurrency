import random

def generate_random_price(base_price: float, variance: float = 50.0) -> float:
    return round(base_price + random.uniform(-variance, variance), 2)
