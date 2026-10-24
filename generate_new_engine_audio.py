import asyncio
import edge_tts
import hashlib
import json
import os
import re
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

new_texts = [
    # Nhạc cụ
    "Đàn chuông sắc màu: Bé gõ các thanh đàn phát ra nốt nhạc vui tai!",
    "Mời bé cùng nghe giai điệu Kìa Con Bướm Vàng nhé!",
    "Bé hãy gõ thử các phím đàn xem nào!",
    "Đồ", "Rê", "Mi", "Pha", "Son", "La", "Si", "Đố",
    "Bé gõ nốt Đồ hay quá!",
    "Bé gõ nốt Rê hay quá!",
    "Bé gõ nốt Mi hay quá!",
    "Bé gõ nốt Pha hay quá!",
    "Bé gõ nốt Son hay quá!",
    "Bé gõ nốt La hay quá!",
    "Bé gõ nốt Si hay quá!",
    "Bé gõ nốt Đố hay quá!",
    
    # Giao thông
    "Bé chạm vào đèn giao thông: Đèn đỏ dừng lại, đèn xanh được đi nhé!",
    "Đèn xanh rồi, các bạn xe bon bon lăn bánh nào!",
    "Đèn đỏ rồi, các bạn xe dừng lại ngay ngắn nhé!",
    "Bé điều khiển giao thông giỏi quá!",
    "Bé tham gia giao thông: Chạm vào đèn giao thông để điều khiển xe cộ!",

    # Trí nhớ & Thẻ bài
    "Bé hãy lật tìm các cặp thẻ mẹ con giống nhau nhé!",
    "Bé hãy lật tìm hai thẻ giống nhau nhé!",
    "Trò chơi Trí Nhớ: Bé chạm lật tìm các cặp thẻ giống nhau nhé!",
    "Tuyệt vời! Cặp đôi Con mèo!",
    "Tuyệt vời! Cặp đôi Cún con!",
    "Tuyệt vời! Cặp đôi Con vịt!",
    "Mèo mẹ", "Mèo con", "Chó mẹ", "Vịt mẹ", "Vịt con",
    "Con mèo", "Cún con", "Con vịt",

    # Nối số
    "Bé hãy nối các số theo thứ tự để vẽ hình nhé!",
    "Bé nối các số từ 1 đến 10 nhé!",
    "Bé nối các số từ 1 đến 5 nhé!",
    "Bé vẽ được Hình Ngôi Sao rồi! Tuyệt vời!",
    "Bé vẽ được Ngôi Nhà Thân Yêu rồi! Tuyệt vời!",
    "Bé vẽ được Trái Tim Yêu Thương rồi! Tuyệt vời!",
    "Bé nối số vẽ hình: Nối các số 1 đến 10 để tạo ra Hình Ngôi Sao!",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",

    # Khớp bóng
    "Bé hãy tìm và ghép đúng bóng của các bạn thú nhé!",
    "Bé hãy ghép mảnh vào đúng bóng mờ nhé!",
    "Bé hãy chọn mảnh ghép bên dưới trước nhé!",
    "Bóng này chưa khớp rồi, bé thử lại nhé!",
    "Chú voi", "Sư tử", "Hươu cao cổ",
    "Đúng rồi! Chú voi!", "Đúng rồi! Sư tử!", "Đúng rồi! Hươu cao cổ!"
]

def norm(t: str) -> str:
    return re.sub(r'\s+', ' ', t.strip().lower())

def h(t: str) -> str:
    return hashlib.md5(norm(t).encode('utf-8')).hexdigest()[:12]

async def main():
    manifest_path = 'public/audio/manifest.json'
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
    else:
        manifest = {}

    print(f"Bắt đầu tạo audio cho {len(new_texts)} câu mới...")
    success = 0
    for t in new_texts:
        k = norm(t)
        v = h(t)
        manifest[k] = v
        f_p = f'public/audio/female/{v}.mp3'
        m_p = f'public/audio/male/{v}.mp3'
        
        try:
            if not os.path.exists(f_p) or os.path.getsize(f_p) < 400:
                await edge_tts.Communicate(t, 'vi-VN-HoaiMyNeural', rate='+4%', pitch='+3Hz').save(f_p)
            if not os.path.exists(m_p) or os.path.getsize(m_p) < 400:
                await edge_tts.Communicate(t, 'vi-VN-NamMinhNeural', rate='+4%', pitch='+1Hz').save(m_p)
            success += 1
        except Exception as e:
            print(f"Lỗi câu '{t}':", e)

    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"Hoàn thành! Đã tạo thành công {success}/{len(new_texts)} câu. Manifest hiện có {len(manifest)} mục.")

if __name__ == '__main__':
    asyncio.run(main())
