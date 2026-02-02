import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle

# Load the Iris dataset
df = pd.read_csv('iris.csv')

# Ensure the dataset contains only the 4 relevant features and the target
X = df[['Sepal.Length', 'Sepal.Width', 'Petal.Length', 'Petal.Width']]  # 4 features
y = df['Species']  # Target variable

# Train the model
model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Save the trained model to a pickle file
with open('iris_model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Model saved as iris_model.pkl")
