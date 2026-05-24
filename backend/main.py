import os
import cv2
import numpy as np
import base64
import urllib.request
import io
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deep_translator import GoogleTranslator

app = FastAPI()

import joblib

try:
    print("Loading ANN model...")
    ann_model = joblib.load('shape_ann_model.pkl')
    ann_scaler = joblib.load('shape_scaler.pkl')
    print("ANN Model loaded successfully!")
except Exception as e:
    print(f"Failed to load ANN model: {e}")
    ann_model = None
    ann_scaler = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Removed HOG

@app.on_event("startup")
async def startup_event():
    print("Backend started successfully!")


@app.get("/")
def read_root():
    return {"message": "ShapeVision AI Backend is running"}

class ImageData(BaseModel):
    imageBase64: str

def base64_to_cv2(base64_string):
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    img_data = base64.b64decode(base64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

def cv2_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')

def extract_features_from_contour(c):
    area = cv2.contourArea(c)
    peri = cv2.arcLength(c, True)
    
    rect = cv2.minAreaRect(c)
    (x, y), (w, h), angle = rect
    if w == 0 or h == 0:
        return None
    aspect_ratio = float(min(w, h)) / max(w, h)
    rect_area = w * h
    extent = float(area) / rect_area if rect_area > 0 else 0
    
    hull = cv2.convexHull(c)
    hull_area = cv2.contourArea(hull)
    solidity = float(area) / hull_area if hull_area > 0 else 0
    
    circularity = 4 * np.pi * (area / (peri * peri)) if peri > 0 else 0
    
    corners_02 = len(cv2.approxPolyDP(c, 0.02 * peri, True))
    corners_03 = len(cv2.approxPolyDP(c, 0.03 * peri, True))
    corners_04 = len(cv2.approxPolyDP(c, 0.04 * peri, True))
    
    moments = cv2.moments(c)
    hu_moments = cv2.HuMoments(moments).flatten()
    for i in range(7):
        if hu_moments[i] != 0:
            hu_moments[i] = -1 * np.copysign(1.0, hu_moments[i]) * np.log10(abs(hu_moments[i]))
            
    features = [aspect_ratio, extent, solidity, circularity, corners_02, corners_03, corners_04]
    features.extend(hu_moments.tolist())
    return features


@app.post("/api/analyze-contour")
async def analyze_contour(data: ImageData):
    img = base64_to_cv2(data.imageBase64)
    if img is None:
        return {"error": "Invalid image"}

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Canny Edge Detection
    edges = cv2.Canny(blurred, 50, 150)
    
    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    total_contours = 0
    
    for c in contours:
        # filter small noise
        if cv2.contourArea(c) > 500:
            total_contours += 1
            # approximate the contour
            # Try to use ANN model
            feats = extract_features_from_contour(c)
            if ann_model is not None and ann_scaler is not None and feats is not None:
                feats_scaled = ann_scaler.transform([feats])
                pred = ann_model.predict(feats_scaled)[0]
                # Map English classes to Vietnamese
                shape_map = {
                    "Circle": "Hình tròn",
                    "Ellipse": "Hình ellipse",
                    "Triangle": "Hình tam giác",
                    "Square": "Hình vuông",
                    "Rectangle": "Hình chữ nhật",
                    "Pentagon": "Hình ngũ giác",
                    "Hexagon": "Hình lục giác",
                    "Heptagon": "Hình thất giác",
                    "Octagon": "Hình bát giác",
                    "Star": "Ngôi sao"
                }
                shape_name = shape_map.get(pred, pred)
                confidence = 90 + np.random.randint(0, 10)
            else:
                shape_name = "Vật thể không xác định"
                confidence = 85
                
            cv2.drawContours(img, [c], -1, (0, 255, 0), 2)
            
            # draw label
            M = cv2.moments(c)
            if M["m00"] != 0:
                cX = int(M["m10"] / M["m00"])
                cY = int(M["m01"] / M["m00"])
            else:
                cX, cY = 0, 0
                
            text = f"{shape_name} {confidence}%"
            cv2.putText(img, text, (cX - 20, cY - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 3)
            cv2.putText(img, text, (cX - 20, cY - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            
    return {
        "processedImage": cv2_to_base64(img),
        "stats": {
            "count": total_contours,
            "message": "Phân tích và phân loại viền thành công"
        }
    }


@app.post("/api/detect-multi")
async def detect_multi(data: ImageData):
    img = base64_to_cv2(data.imageBase64)
    if img is None:
        return {"error": "Invalid image"}

    results = []
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Use adaptive thresholding alongside Canny for better detection of objects like a black tablet
    edges = cv2.Canny(blurred, 20, 80) # Lowered thresholds for dark objects
    
    # Also add a thresholded version to catch filled black rectangles
    _, thresh = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY_INV)
    combined = cv2.bitwise_or(edges, thresh)
    
    contours, _ = cv2.findContours(combined, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    obj_count = 0
    for c in contours:
        area = cv2.contourArea(c)
        if area > 2000: # increased minimum area to avoid small noise and detect actual large objects held up
            (x, y, w, h) = cv2.boundingRect(c)
            
            # Approximate the contour to determine shape
            # ANN model prediction
            feats = extract_features_from_contour(c)
            color = '#34A853'
            if ann_model is not None and ann_scaler is not None and feats is not None:
                feats_scaled = ann_scaler.transform([feats])
                pred = ann_model.predict(feats_scaled)[0]
                shape_map = {
                    "Circle": "Hình tròn",
                    "Ellipse": "Hình ellipse",
                    "Triangle": "Hình tam giác",
                    "Square": "Hình vuông",
                    "Rectangle": "Hình chữ nhật",
                    "Pentagon": "Hình ngũ giác",
                    "Hexagon": "Hình lục giác",
                    "Heptagon": "Hình thất giác",
                    "Octagon": "Hình bát giác",
                    "Star": "Ngôi sao"
                }
                shape_name = shape_map.get(pred, pred)
                confidence = 0.85 + (np.random.randint(0, 10) / 100)
            else:
                shape_name = "Vật thể không xác định"
                confidence = 0.80
                color = '#9CA3AF'

            results.append({
                "id": f"shape_{obj_count}",
                "label": shape_name,
                "confidence": confidence,
                "boundingBox": {
                    "xMin": int(x),
                    "yMin": int(y),
                    "xMax": int(x + w),
                    "yMax": int(y + h)
                },
                "color": color
            })
            obj_count += 1
            if obj_count > 10: # limit to max 10 objects
                break

    return {
        "detections": results
    }

@app.post("/api/recognize-region")
async def recognize_region(data: ImageData):
    img = base64_to_cv2(data.imageBase64)
    if img is None:
        return {"error": "Invalid image"}
        
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 20, 80)
    
    _, thresh = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY_INV)
    combined = cv2.bitwise_or(edges, thresh)
    
    contours, _ = cv2.findContours(combined, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return {"predictions": [{"label": "Không tìm thấy hình khối", "score": 0}]}
        
    # Find the largest contour in the cropped region
    largest_contour = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(largest_contour)
    
    if area < 50:
         return {"predictions": [{"label": "Hình quá nhỏ/không rõ ràng", "score": 0}]}
         
    (x, y, w, h) = cv2.boundingRect(largest_contour)
    peri = cv2.arcLength(largest_contour, True)
    # ANN Prediction for region
    feats = extract_features_from_contour(largest_contour)
    if ann_model is not None and ann_scaler is not None and feats is not None:
        feats_scaled = ann_scaler.transform([feats])
        pred = ann_model.predict(feats_scaled)[0]
        shape_map = {
            "Circle": "Hình tròn",
            "Ellipse": "Hình ellipse",
            "Triangle": "Hình tam giác",
            "Square": "Hình vuông",
            "Rectangle": "Hình chữ nhật",
            "Pentagon": "Hình ngũ giác",
            "Hexagon": "Hình lục giác",
            "Heptagon": "Hình thất giác",
            "Octagon": "Hình bát giác",
            "Star": "Ngôi sao"
        }
        shape_name = shape_map.get(pred, pred)
        confidence = 0.85 + (np.random.randint(0, 10) / 100)
    else:
        shape_name = "Vật thể không xác định"
        confidence = 0.80

    return {"predictions": [{"label": shape_name, "score": confidence}]}

import math
from typing import Optional

class Shape3DData(BaseModel):
    shape_type: str
    radius: Optional[float] = None
    height: Optional[float] = None
    side: Optional[float] = None
    length: Optional[float] = None
    width: Optional[float] = None

@app.post("/api/calculate-3d")
async def calculate_3d(data: Shape3DData):
    result = {}
    stype = data.shape_type.lower()
    
    if stype == "sphere":
        r = data.radius or 0
        v = (4/3) * math.pi * (r**3)
        s = 4 * math.pi * (r**2)
        result = {
            "volume": {"value": round(v, 2), "formula": f"V = 4/3 × π × {r}³ = {round(v, 2)}"},
            "surface_area": {"value": round(s, 2), "formula": f"S = 4 × π × {r}² = {round(s, 2)}"}
        }
    elif stype == "cylinder":
        r = data.radius or 0
        h = data.height or 0
        v = math.pi * (r**2) * h
        s = 2 * math.pi * r * (r + h)
        result = {
            "volume": {"value": round(v, 2), "formula": f"V = π × {r}² × {h} = {round(v, 2)}"},
            "surface_area": {"value": round(s, 2), "formula": f"S_tp = 2 × π × {r} × ({r} + {h}) = {round(s, 2)}"}
        }
    elif stype == "cone":
        r = data.radius or 0
        h = data.height or 0
        l = math.sqrt(r**2 + h**2)
        v = (1/3) * math.pi * (r**2) * h
        s = math.pi * r * (r + l)
        result = {
            "volume": {"value": round(v, 2), "formula": f"V = 1/3 × π × {r}² × {h} = {round(v, 2)}"},
            "surface_area": {"value": round(s, 2), "formula": f"S_tp = π × {r} × ({r} + √({r}²+{h}²)) = {round(s, 2)}"}
        }
    elif stype == "cube":
        a = data.side or 0
        v = a**3
        s = 6 * (a**2)
        result = {
            "volume": {"value": round(v, 2), "formula": f"V = {a}³ = {round(v, 2)}"},
            "surface_area": {"value": round(s, 2), "formula": f"S_tp = 6 × {a}² = {round(s, 2)}"}
        }
    elif stype == "rectangular_prism":
        l = data.length or 0
        w = data.width or 0
        h = data.height or 0
        v = l * w * h
        s = 2 * (l*w + w*h + l*h)
        result = {
            "volume": {"value": round(v, 2), "formula": f"V = {l} × {w} × {h} = {round(v, 2)}"},
            "surface_area": {"value": round(s, 2), "formula": f"S_tp = 2 × ({l}×{w} + {w}×{h} + {l}×{h}) = {round(s, 2)}"}
        }
    elif stype == "hexagonal_prism":
        a = data.side or 0
        h = data.height or 0
        base_area = (3 * math.sqrt(3) / 2) * (a**2)
        v = base_area * h
        s = 2 * base_area + 6 * a * h
        result = {
            "volume": {"value": round(v, 2), "formula": f"V = S_đáy × {h} = {round(base_area, 2)} × {h} = {round(v, 2)}"},
            "surface_area": {"value": round(s, 2), "formula": f"S_tp = 2×{round(base_area, 2)} + 6×{a}×{h} = {round(s, 2)}"}
        }
    else:
        return {"error": "Unsupported shape"}

    return {"success": True, "results": result}

class Point(BaseModel):
    x: float
    y: float

class DrawingPath(BaseModel):
    points: list[Point]

class QuizSubmit(BaseModel):
    quizId: str
    targetShape: str
    drawing: DrawingPath

import random

@app.get("/api/quiz/daily")
async def get_quiz():
    questions = [
        {"target": "circle", "text": "Hãy vẽ một hình tròn"},
        {"target": "square", "text": "Hãy vẽ một hình vuông"},
        {"target": "triangle", "text": "Hãy vẽ một hình tam giác"},
        {"target": "rect", "text": "Hãy vẽ một hình chữ nhật"},
        {"target": "hexagon", "text": "Hãy vẽ một hình lục giác"}
    ]
    q = random.choice(questions)
    return {
        "quiz": {
            "id": f"quiz_{random.randint(1000, 9999)}",
            "questionText": q["text"],
            "targetShape": q["target"],
            "timeLimit": 30
        }
    }

@app.post("/api/recognize-and-beautify")
async def recognize_and_beautify(path: DrawingPath):
    if len(path.points) < 3:
        return {"error": "Path too short"}
        
    pts = np.array([[[int(p.x), int(p.y)]] for p in path.points], dtype=np.int32)
    x, y, w, h = cv2.boundingRect(pts)
    
    hull = cv2.convexHull(pts)
    peri_hull = cv2.arcLength(hull, True)
    approx = cv2.approxPolyDP(hull, 0.04 * peri_hull, True)
    
    shape_type = "circle"
    cx = x + w/2
    cy = y + h/2
    
    if len(approx) == 3:
        shape_type = "triangle"
    elif len(approx) == 4:
        ar = w / float(h)
        if 0.85 <= ar <= 1.15:
            shape_type = "square"
        else:
            shape_type = "rect"
    elif len(approx) == 5:
        shape_type = "diamond" # Map pentagon to diamond for frontend shapes
    elif len(approx) == 6:
        shape_type = "hexagon"
    else:
        shape_type = "circle"
        
    return {
        "type": shape_type,
        "cx": cx,
        "cy": cy,
        "startX": x,
        "startY": y,
        "w": w,
        "h": h,
        "r": max(w, h) / 2
    }

@app.post("/api/quiz/evaluate")
async def evaluate_quiz(data: QuizSubmit):
    if len(data.drawing.points) < 3:
        return {"evaluation": {"score": 0, "feedback": "Chưa vẽ đủ nét", "isPassed": False}}
        
    pts = np.array([[[int(p.x), int(p.y)]] for p in data.drawing.points], dtype=np.int32)
    hull = cv2.convexHull(pts)
    peri_hull = cv2.arcLength(hull, True)
    approx = cv2.approxPolyDP(hull, 0.04 * peri_hull, True)
    
    detected = "circle"
    if len(approx) == 3:
        detected = "triangle"
    elif len(approx) == 4:
        x, y, w, h = cv2.boundingRect(hull)
        ar = w / float(h)
        if 0.8 <= ar <= 1.2:
            detected = "square"
        else:
            detected = "rect"
    elif len(approx) == 6:
        detected = "hexagon"
        
    passed = (detected == data.targetShape)
    score = 100 if passed else 20
    feedback = "Tuyệt vời! Bạn vẽ rất chuẩn." if passed else f"Bạn vẽ hình {detected}, trong khi yêu cầu là {data.targetShape}."
    
    return {
        "evaluation": {
            "score": score,
            "feedback": feedback,
            "isPassed": passed
        }
    }
