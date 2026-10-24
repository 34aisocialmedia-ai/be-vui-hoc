import os
import sys
import urllib.request

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

PHOTOS = {
    # Danh lam Hà Nội (Rất cần ảnh thật)
    "hanoi_hoguom": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/H%E1%BB%93_G%C6%B0%C6%A1m_v%E1%BB%81_%C4%91%C3%AAm.jpg/640px-H%E1%BB%93_G%C6%B0%C6%A1m_v%E1%BB%81_%C4%91%C3%AAm.jpg",
    "hanoi_chuamotcot": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/One_Pillar_Pagoda_Hanoi.JPG/640px-One_Pillar_Pagoda_Hanoi.JPG",
    "hanoi_vanmieu": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Khue_Van_Cac_Temple_of_Literature.jpg/640px-Khue_Van_Cac_Temple_of_Literature.jpg",
    "hanoi_langbac": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Ho_Chi_Minh_Mausoleum_Hanoi_Vietnam.jpg/640px-Ho_Chi_Minh_Mausoleum_Hanoi_Vietnam.jpg",
    "hanoi_longbien": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Long_Bien_bridge_Vietnam.jpg/640px-Long_Bien_bridge_Vietnam.jpg",
    "hanoi_com": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/C%E1%BB%91m_L%C3%A0ng_V%C3%B2ng_H%C3%A0_N%E1%BB%99i.jpg/640px-C%E1%BB%91m_L%C3%A0ng_V%C3%B2ng_H%C3%A0_N%E1%BB%99i.jpg",
    "hanoi_pho": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pho-Beef-Noodles-2008.jpg/640px-Pho-Beef-Noodles-2008.jpg",
    "hanoi_roinuoc": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Water_puppet_theatre_Hanoi_Vietnam.jpg/640px-Water_puppet_theatre_Hanoi_Vietnam.jpg",

    # Động vật ảnh thật cho trẻ mầm non
    "cat_real": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80",
    "dog_real": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80",
    "rabbit_real": "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&auto=format&fit=crop&q=80",
    "duck_real": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80",
    "elephant_real": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&auto=format&fit=crop&q=80",
    "chicken_real": "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop&q=80",
    "cow_real": "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&auto=format&fit=crop&q=80",

    # Hoa quả ảnh thật
    "apple_real": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
    "banana_real": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80",
    "watermelon_real": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80",
    "strawberry_real": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80",

    # Phương tiện giao thông ảnh thật
    "car_real": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    "bus_real": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    "fire_truck_real": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
    "ambulance_real": "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=600&auto=format&fit=crop&q=80"
}

def main():
    target_dir = r"c:\app student\app\public\assets\photos"
    os.makedirs(target_dir, exist_ok=True)
    
    print(f"Bắt đầu tải {len(PHOTOS)} ảnh thật chất lượng cao...")
    success = 0
    for name, url in PHOTOS.items():
        out_file = os.path.join(target_dir, f"{name}.jpg")
        if os.path.exists(out_file) and os.path.getsize(out_file) > 1000:
            success += 1
            continue
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=12) as resp:
                if resp.status == 200:
                    with open(out_file, 'wb') as fp:
                        fp.write(resp.read())
                    print(f" -> Tải thành công {name}.jpg")
                    success += 1
        except Exception as e:
            print(f"Lỗi tải {name}: {e}")

    print(f"Hoàn thành! Đã tải {success}/{len(PHOTOS)} ảnh thật.")

if __name__ == '__main__':
    main()
