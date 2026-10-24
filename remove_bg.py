import os
import sys
import glob
from PIL import Image

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from collections import deque
import numpy as np

def process_image(src_path, dst_path):
    print(f"Đang xử lý: {src_path} -> {dst_path}")
    img = Image.open(src_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Tạo mảng mask cho điểm nền
    is_bg = np.zeros((height, width), dtype=bool)
    visited = np.zeros((height, width), dtype=bool)

    # Khởi tạo hàng đợi floodfill từ 4 cạnh viền
    queue = deque()
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    def is_white_or_near(r, g, b):
        return r >= 238 and g >= 238 and b >= 238

    while queue:
        cx, cy = queue.popleft()
        if visited[cy, cx]:
            continue
        visited[cy, cx] = True

        r, g, b, a = pixels[cx, cy]
        if is_white_or_near(r, g, b):
            is_bg[cy, cx] = True
            for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                if 0 <= nx < width and 0 <= ny < height and not visited[ny, nx]:
                    queue.append((nx, ny))

    # Cập nhật alpha cho ảnh
    for y in range(height):
        for x in range(width):
            if is_bg[y, x]:
                pixels[x, y] = (255, 255, 255, 0)
            else:
                # Kiểm tra lân cận nếu giáp viền nền thì làm mịn alpha
                r, g, b, a = pixels[x, y]
                if r > 220 and g > 220 and b > 220:
                    # Đếm số pixel nền xung quanh
                    bg_neighbors = 0
                    for dx, dy in ((-1,0),(1,0),(0,-1),(0,1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < width and 0 <= ny < height and is_bg[ny, nx]:
                            bg_neighbors += 1
                    if bg_neighbors > 0:
                        alpha = int(255 * (1.0 - (min(r, g, b) - 220) / 35.0))
                        pixels[x, y] = (r, g, b, max(0, min(255, alpha)))

    img.save(dst_path, "PNG")
    print(f" -> Đã tách nền trong suốt thành công: {dst_path}")

if __name__ == '__main__':
    artifact_dir = r"C:\Users\fjs\.gemini\antigravity\brain\0da77977-c838-4a5f-a1b6-2446f68a59b6"
    target_dir = r"c:\app student\app\public\assets\images"
    os.makedirs(target_dir, exist_ok=True)

    mappings = [
        ("letter_tree_mascot_*.jpg", "mascot_rabbit.png"),
        ("train_locomotive_*.jpg", "train_locomotive.png"),
        ("balance_scale_*.jpg", "balance_scale.png"),
        ("alphabet_fruit_tree_*.jpg", "alphabet_tree.png"),
    ]

    for pattern, out_name in mappings:
        matches = glob.glob(os.path.join(artifact_dir, pattern))
        if matches:
            latest = sorted(matches)[-1]
            out_file = os.path.join(target_dir, out_name)
            process_image(latest, out_file)
        else:
            print(f"Không tìm thấy file khớp {pattern}")
