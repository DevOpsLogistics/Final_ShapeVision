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

try:
    from transformers import pipeline
    print("Loading AI model for image classification (MobileNetV2)...")
    classifier = pipeline('image-classification', model='google/mobilenet_v2_1.0_224')
    print("AI Model loaded successfully!")
except Exception as e:
    print(f"Failed to load AI model or transformers not installed yet: {e}")
    classifier = None

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
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.04 * peri, True)
            area = cv2.contourArea(c)
            circularity = 4 * np.pi * (area / (peri * peri)) if peri > 0 else 0
            
            def get_angle(pt1, pt2, pt0):
                dx1 = pt1[0][0] - pt0[0][0]
                dy1 = pt1[0][1] - pt0[0][1]
                dx2 = pt2[0][0] - pt0[0][0]
                dy2 = pt2[0][1] - pt0[0][1]
                return (dx1*dx2 + dy1*dy2) / np.sqrt((dx1*dx1 + dy1*dy1)*(dx2*dx2 + dy2*dy2) + 1e-10)

            shape_name = "Object"
            confidence = 80 + np.random.randint(0, 15) # mock confidence
            if len(approx) == 3:
                shape_name = "Tam giác"
                confidence = 95
            elif len(approx) == 4:
                # Calculate side lengths
                d1 = np.linalg.norm(approx[0][0] - approx[1][0])
                d2 = np.linalg.norm(approx[1][0] - approx[2][0])
                d3 = np.linalg.norm(approx[2][0] - approx[3][0])
                d4 = np.linalg.norm(approx[3][0] - approx[0][0])
                
                # Check angles (cosine)
                cosines = []
                for j in range(4):
                    cosines.append(get_angle(approx[(j+1)%4], approx[(j-1)%4], approx[j]))
                
                max_cos = max([abs(c) for c in cosines])
                is_rect = max_cos < 0.15 # Approx 90 degrees
                
                sides = [d1, d2, d3, d4]
                max_side = max(sides)
                min_side = min(sides)
                all_equal = (max_side - min_side) / max_side < 0.2
                
                if is_rect and all_equal:
                    shape_name = "Hình vuông"
                elif is_rect and not all_equal:
                    shape_name = "Hình chữ nhật"
                elif not is_rect and all_equal:
                    shape_name = "Hình thoi"
                else:
                    # Check parallel sides for parallelogram / trapezoid
                    shape_name = "Hình bình hành" if (abs(d1-d3)/max(d1,d3) < 0.2 and abs(d2-d4)/max(d2,d4) < 0.2) else "Hình thang"
                confidence = 92
            elif len(approx) == 5:
                shape_name = "Ngũ giác"
                confidence = 88
            elif len(approx) == 6:
                shape_name = "Lục giác"
                confidence = 88
            elif len(approx) == 7:
                shape_name = "Thất giác"
                confidence = 88
            elif len(approx) == 8:
                shape_name = "Bát giác"
                confidence = 88
            elif len(approx) == 9:
                shape_name = "Cửu giác"
                confidence = 88
            elif len(approx) == 10:
                # Could be a 5-pointed star or a decagon
                shape_name = "Ngôi sao 5 cánh" if circularity < 0.5 else "Thập giác"
                confidence = 90
            elif len(approx) == 12:
                shape_name = "Ngôi sao 6 cánh / Thập nhị giác"
                confidence = 90
            else:
                if circularity > 0.8:
                    shape_name = "Hình tròn"
                    confidence = 85
                elif circularity > 0.6:
                    shape_name = "Hình ellipse"
                    confidence = 85
                elif circularity > 0.4:
                    shape_name = "Bán nguyệt / Vòm"
                    confidence = 80
                else:
                    shape_name = "Đa giác phức tạp"
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
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.04 * peri, True)
            circularity = 4 * np.pi * (area / (peri * peri)) if peri > 0 else 0
            
            def get_angle(pt1, pt2, pt0):
                dx1 = pt1[0][0] - pt0[0][0]
                dy1 = pt1[0][1] - pt0[0][1]
                dx2 = pt2[0][0] - pt0[0][0]
                dy2 = pt2[0][1] - pt0[0][1]
                return (dx1*dx2 + dy1*dy2) / np.sqrt((dx1*dx1 + dy1*dy1)*(dx2*dx2 + dy2*dy2) + 1e-10)
            
            shape_name = "Object"
            confidence = 0.8 + (np.random.randint(0, 15) / 100) # mock confidence 80-95%
            color = '#34A853'
            
            if len(approx) == 3:
                shape_name = "Hình tam giác"
                confidence = 0.95
                color = '#F59E0B'
            elif len(approx) == 4:
                d1 = np.linalg.norm(approx[0][0] - approx[1][0])
                d2 = np.linalg.norm(approx[1][0] - approx[2][0])
                d3 = np.linalg.norm(approx[2][0] - approx[3][0])
                d4 = np.linalg.norm(approx[3][0] - approx[0][0])
                
                cosines = []
                for j in range(4):
                    cosines.append(get_angle(approx[(j+1)%4], approx[(j-1)%4], approx[j]))
                
                max_cos = max([abs(ang) for ang in cosines])
                is_rect = max_cos < 0.15
                
                sides = [d1, d2, d3, d4]
                max_side = max(sides)
                min_side = min(sides)
                all_equal = (max_side - min_side) / max_side < 0.2
                
                if is_rect and all_equal:
                    shape_name = "Hình vuông"
                elif is_rect and not all_equal:
                    shape_name = "Hình chữ nhật"
                elif not is_rect and all_equal:
                    shape_name = "Hình thoi"
                else:
                    shape_name = "Hình bình hành" if (abs(d1-d3)/max(d1,d3) < 0.2 and abs(d2-d4)/max(d2,d4) < 0.2) else "Hình thang"
                confidence = 0.92
                color = '#3B82F6'
            elif len(approx) == 5:
                shape_name = "Hình ngũ giác"
                confidence = 0.88
                color = '#8B5CF6'
            elif len(approx) == 6:
                shape_name = "Hình lục giác"
                confidence = 0.88
                color = '#8B5CF6'
            elif len(approx) == 7:
                shape_name = "Hình thất giác"
                confidence = 0.88
                color = '#8B5CF6'
            elif len(approx) == 8:
                shape_name = "Hình bát giác"
                confidence = 0.88
                color = '#8B5CF6'
            elif len(approx) == 9:
                shape_name = "Hình cửu giác"
                confidence = 0.88
                color = '#8B5CF6'
            elif len(approx) == 10:
                shape_name = "Ngôi sao 5 cánh" if circularity < 0.5 else "Hình thập giác"
                confidence = 0.90
                color = '#F43F5E'
            elif len(approx) == 12:
                shape_name = "Ngôi sao 6 cánh / Thập nhị giác"
                confidence = 0.90
                color = '#F43F5E'
            else:
                if circularity > 0.8:
                    shape_name = "Hình tròn"
                    confidence = 0.85
                    color = '#06B6D4'
                elif circularity > 0.6:
                    shape_name = "Hình ellipse"
                    confidence = 0.85
                    color = '#06B6D4'
                elif circularity > 0.4:
                    shape_name = "Hình bán nguyệt"
                    confidence = 0.80
                    color = '#06B6D4'
                else:
                    shape_name = "Vật thể không xác định"
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
    approx = cv2.approxPolyDP(largest_contour, 0.04 * peri, True)
    circularity = 4 * np.pi * (area / (peri * peri)) if peri > 0 else 0
    
    def get_angle(pt1, pt2, pt0):
        dx1 = pt1[0][0] - pt0[0][0]
        dy1 = pt1[0][1] - pt0[0][1]
        dx2 = pt2[0][0] - pt0[0][0]
        dy2 = pt2[0][1] - pt0[0][1]
        return (dx1*dx2 + dy1*dy2) / np.sqrt((dx1*dx1 + dy1*dy1)*(dx2*dx2 + dy2*dy2) + 1e-10)

    shape_name = "Đa giác phức tạp"
    confidence = 0.85
    
    if len(approx) == 3:
        shape_name = "Hình tam giác"
        confidence = 0.95
    elif len(approx) == 4:
        d1 = np.linalg.norm(approx[0][0] - approx[1][0])
        d2 = np.linalg.norm(approx[1][0] - approx[2][0])
        d3 = np.linalg.norm(approx[2][0] - approx[3][0])
        d4 = np.linalg.norm(approx[3][0] - approx[0][0])
        
        cosines = []
        for j in range(4):
            cosines.append(get_angle(approx[(j+1)%4], approx[(j-1)%4], approx[j]))
        
        max_cos = max([abs(c) for c in cosines])
        is_rect = max_cos < 0.15
        
        sides = [d1, d2, d3, d4]
        max_side = max(sides)
        min_side = min(sides)
        all_equal = (max_side - min_side) / max_side < 0.2
        
        if is_rect and all_equal:
            shape_name = "Hình vuông"
        elif is_rect and not all_equal:
            shape_name = "Hình chữ nhật"
        elif not is_rect and all_equal:
            shape_name = "Hình thoi"
        else:
            shape_name = "Hình bình hành" if (abs(d1-d3)/max(d1,d3) < 0.2 and abs(d2-d4)/max(d2,d4) < 0.2) else "Hình thang"
        confidence = 0.92
    elif len(approx) == 5:
        shape_name = "Hình ngũ giác"
        confidence = 0.88
    elif len(approx) == 6:
        shape_name = "Hình lục giác"
        confidence = 0.88
    elif len(approx) == 7:
        shape_name = "Hình thất giác"
        confidence = 0.88
    elif len(approx) == 8:
        shape_name = "Hình bát giác"
        confidence = 0.88
    elif len(approx) == 9:
        shape_name = "Hình cửu giác"
        confidence = 0.88
    elif len(approx) == 10:
        shape_name = "Ngôi sao 5 cánh" if circularity < 0.5 else "Hình thập giác"
        confidence = 0.90
    elif len(approx) == 12:
        shape_name = "Ngôi sao 6 cánh / Thập nhị giác"
        confidence = 0.90
    else:
        if circularity > 0.8:
            shape_name = "Hình tròn"
            confidence = 0.90
        elif circularity > 0.6:
            shape_name = "Hình ellipse"
            confidence = 0.85
        elif circularity > 0.4:
            shape_name = "Hình bán nguyệt"
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
