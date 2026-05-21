import cv2
import numpy as np
import base64
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid

app = FastAPI()

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DetectRequest(BaseModel):
    imageBase64: str

def decode_base64_image(base64_string: str) -> np.ndarray:
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def detect_shapes(image: np.ndarray):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Thresholding to get binary image
    # We use adaptive threshold or simple threshold. Let's try Canny edge first.
    edges = cv2.Canny(blurred, 50, 150)
    
    # Dilation to connect broken edges
    kernel = np.ones((3,3), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=1)
    
    # Find contours
    contours, _ = cv2.findContours(dilated.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    detections = []
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        # Filter small noise
        if area < 500:
            continue
            
        perimeter = cv2.arcLength(cnt, True)
        # Approximate the contour
        epsilon = 0.04 * perimeter
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        
        vertices = len(approx)
        
        x, y, w, h = cv2.boundingRect(approx)
        
        label = "Không rõ"
        confidence = 0.90
        
        if vertices == 3:
            label = "Hình tam giác"
            confidence = 0.95
        elif vertices == 4:
            # Differentiate between square and rectangle
            aspect_ratio = float(w) / h
            if 0.95 <= aspect_ratio <= 1.05:
                label = "Hình vuông"
            else:
                label = "Hình chữ nhật"
            confidence = 0.96
        elif vertices == 5:
            label = "Hình ngũ giác"
            confidence = 0.92
        elif vertices == 6:
            label = "Hình lục giác"
            confidence = 0.92
        elif vertices > 6:
            # Check circularity
            circularity = 4 * np.pi * (area / (perimeter * perimeter))
            if circularity > 0.8:
                label = "Hình tròn"
                confidence = 0.98
            else:
                label = "Đa giác tự do"
                confidence = 0.85

        detections.append({
            "id": f"det-{str(uuid.uuid4())[:8]}",
            "label": label,
            "confidence": confidence,
            "boundingBox": {
                "xMin": int(x),
                "yMin": int(y),
                "xMax": int(x + w),
                "yMax": int(y + h)
            }
        })
        
    return detections

@app.post("/detect")
async def detect_api(req: DetectRequest):
    try:
        img = decode_base64_image(req.imageBase64)
        if img is None:
            raise ValueError("Invalid image")
        
        detections = detect_shapes(img)
        
        return {
            "message": "Detection successful",
            "detections": detections
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
