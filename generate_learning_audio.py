import asyncio
import edge_tts
import hashlib
import json
import os
import re
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

learning_texts = [
    # Chữ cái O - Ô - Ơ
    "O tròn như quả trứng gà! Bé hãy tìm chữ O nào!",
    "Ô thì đội mũ! Đâu là chữ Ô?",
    "Ơ thì thêm râu! Bé hãy tìm chữ Ơ nhé!",
    "Chữ này là chữ O rồi, bé tìm lại nhé!",
    "Chữ này là chữ Ô rồi, bé tìm lại nhé!",
    "Chữ này là chữ Ơ rồi, bé tìm lại nhé!",
    "Đúng rồi! Chữ O! Bé giỏi quá!",
    "Đúng rồi! Chữ Ô! Bé giỏi quá!",
    "Đúng rồi! Chữ Ơ! Bé giỏi quá!",
    "O", "Ô", "Ơ",

    # Chữ cái A - Ă - Â
    "Bé hãy tìm chữ A nở nụ cười to nhé!",
    "Chữ Ă có vầng trăng khuyết ở trên đâu nhỉ?",
    "Chữ Â đội chiếc mũ xinh xắn ở đâu nào?",
    "Chữ này là chữ A rồi, bé tìm lại nhé!",
    "Chữ này là chữ Ă rồi, bé tìm lại nhé!",
    "Chữ này là chữ Â rồi, bé tìm lại nhé!",
    "Đúng rồi! Chữ A! Bé giỏi quá!",
    "Đúng rồi! Chữ Ă! Bé giỏi quá!",
    "Đúng rồi! Chữ Â! Bé giỏi quá!",
    "A", "Ă", "Â",

    # Đoàn tàu số học
    "Toa xe cần chở 3 quả táo! Bé hãy chạm để xếp lên toa nhé!",
    "Toa xe cần chở 2 chú gà con! Bé hãy chạm để xếp lên toa nhé!",
    "Toa xe cần chở 4 quả dâu tây! Bé hãy chạm để xếp lên toa nhé!",
    "Tuyệt vời! Đã đủ 3 quả táo! Tàu lăn bánh nào!",
    "Tuyệt vời! Đã đủ 2 chú gà con! Tàu lăn bánh nào!",
    "Tuyệt vời! Đã đủ 4 quả dâu tây! Tàu lăn bánh nào!",
    "Nhiều quá rồi, chỉ cần 3 thôi nhé!",
    "Nhiều quá rồi, chỉ cần 2 thôi nhé!",
    "Nhiều quá rồi, chỉ cần 4 thôi nhé!",

    # Cân thăng bằng
    "Bên nào có NHIỀU quả táo hơn? Bé hãy chạm vào đĩa cân nhé!",
    "Bên nào có ÍT củ cà rốt hơn? Bé hãy chạm vào đĩa cân nhé!",
    "Bên nào có NHIỀU ngôi sao hơn? Bé hãy chạm vào đĩa cân nhé!",
    "Bên nào có ÍT quả dâu tây hơn? Bé hãy chạm vào đĩa cân nhé!",
    "Bên nào có NHIỀU chú cá hơn? Bé hãy chạm vào đĩa cân nhé!",
    "Chính xác! Bên này nhiều hơn rồi!",
    "Chính xác! Bên này ít hơn rồi!",
    "Chưa đúng rồi! Bé nhìn kỹ xem bên nào nhiều hơn nhé!",
    "Chưa đúng rồi! Bé nhìn kỹ xem bên nào ít hơn nhé!"
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

    print(f"Bắt đầu tạo giọng đọc cho {len(learning_texts)} câu học tập...")
    success = 0
    for t in learning_texts:
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

    print(f"Hoàn thành! Đã tạo thành công {success}/{len(learning_texts)} câu. Manifest hiện có {len(manifest)} mục.")

if __name__ == '__main__':
    asyncio.run(main())
