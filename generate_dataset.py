import cv2
import numpy as np
import os
import random
import math
import shutil

def create_dataset():
    base_dir = r"C:\Users\MR ASUS\Downloads\ShapeVision_Dataset"
    
    # Create base directory
    if os.path.exists(base_dir):
        shutil.rmtree(base_dir)
    os.makedirs(base_dir)

    shapes = ["Triangle", "Square", "Rectangle", "Rhombus", "Pentagon", "Hexagon", "Heptagon", "Octagon", "Star", "Circle", "Ellipse"]
    samples_per_shape = 300
    img_size = 256

    def random_color():
        return (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))

    def get_polygon_points(center, radius, num_sides, angle_offset=0):
        points = []
        for i in range(num_sides):
            angle = angle_offset + i * (2 * math.pi / num_sides)
            x = int(center[0] + radius * math.cos(angle))
            y = int(center[1] + radius * math.sin(angle))
            points.append([x, y])
        return np.array(points, np.int32)

    def get_star_points(center, outer_radius, inner_radius, num_points=5, angle_offset=0):
        points = []
        for i in range(num_points * 2):
            angle = angle_offset + i * (math.pi / num_points)
            radius = outer_radius if i % 2 == 0 else inner_radius
            x = int(center[0] + radius * math.cos(angle))
            y = int(center[1] + radius * math.sin(angle))
            points.append([x, y])
        return np.array(points, np.int32)

    for shape in shapes:
        shape_dir = os.path.join(base_dir, shape)
        os.makedirs(shape_dir)
        
        for i in range(samples_per_shape):
            # Create a white background image with some noise
            img = np.ones((img_size, img_size, 3), dtype=np.uint8) * 255
            
            # Add random background color occasionally
            if random.random() > 0.5:
                bg_color = random_color()
                # Make it light
                bg_color = tuple(min(255, c + 150) for c in bg_color)
                img[:] = bg_color

            center = (random.randint(60, img_size - 60), random.randint(60, img_size - 60))
            radius = random.randint(30, 80)
            color = random_color()
            thickness = random.choice([-1, 1, 2, 3, 4, 5]) # -1 for filled
            angle_offset = random.uniform(0, 2 * math.pi)

            if shape == "Triangle":
                pts = get_polygon_points(center, radius, 3, angle_offset)
                if thickness == -1:
                    cv2.fillPoly(img, [pts], color)
                else:
                    cv2.polylines(img, [pts], True, color, thickness)
            elif shape == "Square":
                pts = get_polygon_points(center, radius, 4, angle_offset)
                if thickness == -1:
                    cv2.fillPoly(img, [pts], color)
                else:
                    cv2.polylines(img, [pts], True, color, thickness)
            elif shape == "Rectangle":
                w = random.randint(40, 100)
                h = random.randint(20, w - 10) if random.random() > 0.5 else random.randint(w + 10, 120)
                pts = np.array([
                    [-w//2, -h//2], [w//2, -h//2], [w//2, h//2], [-w//2, h//2]
                ])
                # Rotate
                c_a, s_a = np.cos(angle_offset), np.sin(angle_offset)
                R = np.array(((c_a, -s_a), (s_a, c_a)))
                pts = np.dot(pts, R.T) + center
                pts = pts.astype(np.int32)
                if thickness == -1:
                    cv2.fillPoly(img, [pts], color)
                else:
                    cv2.polylines(img, [pts], True, color, thickness)
            elif shape == "Rhombus":
                d1 = random.randint(40, 100)
                d2 = random.randint(20, d1 - 10) if random.random() > 0.5 else random.randint(d1 + 10, 120)
                pts = np.array([
                    [0, -d2//2], [d1//2, 0], [0, d2//2], [-d1//2, 0]
                ])
                c_a, s_a = np.cos(angle_offset), np.sin(angle_offset)
                R = np.array(((c_a, -s_a), (s_a, c_a)))
                pts = np.dot(pts, R.T) + center
                pts = pts.astype(np.int32)
                if thickness == -1:
                    cv2.fillPoly(img, [pts], color)
                else:
                    cv2.polylines(img, [pts], True, color, thickness)
            elif shape == "Pentagon":
                pts = get_polygon_points(center, radius, 5, angle_offset)
                if thickness == -1:
                    cv2.fillPoly(img, [pts], color)
                else:
                    cv2.polylines(img, [pts], True, color, thickness)
            elif shape == "Hexagon":
                pts = get_polygon_points(center, radius, 6, angle_offset)
                if thickness == -1:
                    cv2.fillPoly(img, [pts], color)
                else:
                    cv2.polylines(img, [pts], True, color, thickness)
            elif shape == "Heptagon":
                pts = get_polygon_points(center, radius, 7, angle_offset)
                if thickness == -1:
                    cv2.fillPoly(img, [pts], color)
                else:
                    cv2.polylines(img, [pts], True, color, thickness)
            elif shape == "Octagon":
                pts = get_polygon_points(center, radius, 8, angle_offset)
                if thickness == -1:
                    cv2.fillPoly(img, [pts], color)
                else:
                    cv2.polylines(img, [pts], True, color, thickness)
            elif shape == "Star":
                inner_radius = radius * random.uniform(0.3, 0.5)
                pts = get_star_points(center, radius, inner_radius, 5, angle_offset)
                if thickness == -1:
                    cv2.fillPoly(img, [pts], color)
                else:
                    cv2.polylines(img, [pts], True, color, thickness)
            elif shape == "Circle":
                if thickness == -1:
                    cv2.circle(img, center, radius, color, -1)
                else:
                    cv2.circle(img, center, radius, color, thickness)
            elif shape == "Ellipse":
                axes = (random.randint(40, 80), random.randint(15, 35))
                angle = random.randint(0, 180)
                if thickness == -1:
                    cv2.ellipse(img, center, axes, angle, 0, 360, color, -1)
                else:
                    cv2.ellipse(img, center, axes, angle, 0, 360, color, thickness)

            # Add some random noise
            noise = np.random.normal(0, 15, img.shape).astype(np.uint8)
            img = cv2.add(img, noise)

            # Add occasional blur to simulate bad camera
            if random.random() > 0.7:
                blur_kernel = random.choice([(3,3), (5,5)])
                img = cv2.GaussianBlur(img, blur_kernel, 0)

            file_path = os.path.join(shape_dir, f"{shape}_{i:04d}.jpg")
            cv2.imwrite(file_path, img)
            
    print(f"Dataset generated successfully at {base_dir}")
    
    # Create ZIP file
    zip_path = r"C:\Users\MR ASUS\Downloads\ShapeVision_Dataset.zip"
    shutil.make_archive(zip_path.replace('.zip', ''), 'zip', base_dir)
    print(f"ZIP file created successfully at {zip_path}")

if __name__ == "__main__":
    create_dataset()
