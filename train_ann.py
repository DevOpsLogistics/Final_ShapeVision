import os
import cv2
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
import joblib

DATASET_DIR = r"C:\Users\MR ASUS\Downloads\ShapeVision_Dataset"
MODEL_PATH = r"backend\shape_ann_model.pkl"
SCALER_PATH = r"backend\shape_scaler.pkl"

def extract_features(img_path=None, img=None):
    if img is None and img_path is not None:
        img = cv2.imread(img_path)
    
    if img is None:
        return None
        
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 60, 255, cv2.THRESH_BINARY_INV)
    edges = cv2.Canny(blurred, 50, 150)
    combined = cv2.bitwise_or(edges, thresh)
    
    contours, _ = cv2.findContours(combined, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return None
        
    c = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(c)
    if area < 10:
        return None
        
    peri = cv2.arcLength(c, True)
    
    # 1. Aspect Ratio and Extent using minAreaRect (rotation invariant)
    rect = cv2.minAreaRect(c)
    (x, y), (w, h), angle = rect
    if w == 0 or h == 0:
        return None
    aspect_ratio = float(min(w, h)) / max(w, h)
    rect_area = w * h
    extent = float(area) / rect_area if rect_area > 0 else 0
    
    # 2. Solidity
    hull = cv2.convexHull(c)
    hull_area = cv2.contourArea(hull)
    solidity = float(area) / hull_area if hull_area > 0 else 0
    
    # 3. Circularity
    circularity = 4 * np.pi * (area / (peri * peri)) if peri > 0 else 0
    
    # 4. Approximated corners
    corners_02 = len(cv2.approxPolyDP(c, 0.02 * peri, True))
    corners_03 = len(cv2.approxPolyDP(c, 0.03 * peri, True))
    corners_04 = len(cv2.approxPolyDP(c, 0.04 * peri, True))
    
    # 5. Hu Moments (7 features)
    moments = cv2.moments(c)
    hu_moments = cv2.HuMoments(moments).flatten()
    for i in range(7):
        if hu_moments[i] != 0:
            hu_moments[i] = -1 * np.copysign(1.0, hu_moments[i]) * np.log10(abs(hu_moments[i]))
            
    features = [
        aspect_ratio,
        extent,
        solidity,
        circularity,
        corners_02,
        corners_03,
        corners_04
    ]
    features.extend(hu_moments.tolist())
    
    return features

def train_model():
    print("Loading dataset and extracting features...")
    X = []
    y = []
    
    if not os.path.exists(DATASET_DIR):
        print(f"Dataset directory not found: {DATASET_DIR}")
        return
        
    classes = os.listdir(DATASET_DIR)
    
    for label in classes:
        folder = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(folder):
            continue
            
        print(f"Processing {label}...")
        for file in os.listdir(folder):
            if file.endswith(('.png', '.jpg', '.jpeg')):
                path = os.path.join(folder, file)
                feats = extract_features(img_path=path)
                if feats is not None:
                    X.append(feats)
                    y.append(label)
                    
    X = np.array(X)
    y = np.array(y)
    
    print(f"Dataset shape: {X.shape}")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training ANN model...")
    mlp = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=2000, random_state=42, activation='relu')
    mlp.fit(X_train_scaled, y_train)
    
    print("Evaluating...")
    y_pred = mlp.predict(X_test_scaled)
    print(classification_report(y_test, y_pred))
    
    joblib.dump(mlp, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"Model saved to {MODEL_PATH}")
    print(f"Scaler saved to {SCALER_PATH}")

if __name__ == '__main__':
    train_model()
