import os
import sys
import re
import urllib.request
import concurrent.futures

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Hàm chuyển emoji thành hex string chuẩn
def emoji_to_hex(e: str) -> str:
    # Bỏ FE0F (variation selector 16)
    codes = [f"{ord(c):x}" for c in e if ord(c) != 0xfe0f]
    return "-".join(codes)

def main():
    target_dir = r"c:\app student\app\public\assets\3d"
    os.makedirs(target_dir, exist_ok=True)

    # Đọc tất cả file tsx, ts trong src/ để lấy danh sách emoji
    src_dir = r"c:\app student\app\src"
    all_text = ""
    for root, _, files in os.walk(src_dir):
        for f in files:
            if f.endswith(('.ts', '.tsx')):
                with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as fp:
                    all_text += fp.read() + "\n"

    # Regex bắt tất cả emoji
    emoji_pattern = re.compile(r'[\U00010000-\U0010ffff\u2600-\u27bf\u2300-\u23ff]')
    raw_emojis = set(emoji_pattern.findall(all_text))

    # Bổ sung các emoji thường dùng trong giáo án
    extras = [
        '🐱','🐶','🐔','🦆','🐮','🐷','🐰','🐘','🐟','🐦','🐸','🐴','🐑','🐬','🐙','🦐','🦀','🐳','🐒','🐯','🦁','🦒',
        '🍎','🍌','🍊','🍇','🍉','🍓','🥭','🍐','🍑','🍍','🍒','🌽','🥕','🥬','🥦','🥩','🥚','🥛','🍞',
        '🚗','🚌','🚲','✈️','🚒','🚑','🚓','🚕','🚙','🚚','🚎','🚸','🚦','🛑',
        '🧸','⚽','🥄','🪥','👟','🧢','🪑','📚','⏰','☂️','💎','🎈','⭐','🌟','🌈','🌸','🌹','🌻','🌼','🍀','🍂',
        '🧑‍⚕️','👩‍🏫','🧑‍🌾','🧑‍🍳','🧑‍🚒','🧑‍✈️','🧑‍🎨','👷','🧑‍🎤','💂','💇','🧹','👮',
        '🥁','🎹','🎸','🎺','🎻','🔔',
        '🐢','🛕','🏛️','🇻🇳','🌉','🌾','🍜','🎭','👗','👕','👖','🧦',
        '1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟',
        '🔴','🔵','🟡','🟢','🟣','🟠','⚫','⬛','🔺','🟩','🔷',
        '😀','😢','😨','😠','😮','😊','🥰','🤗','🤝','🙏','👋','🙋','🙇','🤫'
    ]
    all_emojis = list(raw_emojis.union(extras))
    print(f"Tổng cộng tìm thấy {len(all_emojis)} emoji cần tải về 3D...")

    success = 0
    skipped = 0
    failed = []

    def download_one(e):
        h = emoji_to_hex(e)
        out_file = os.path.join(target_dir, f"{h}.webp")
        if os.path.exists(out_file) and os.path.getsize(out_file) > 100:
            return (True, h, True) # Skipped
        
        # Thử 2 định dạng: có thể là h hoặc mã codepoint đơn
        urls = [
            f"https://cdn.jsdelivr.net/npm/@lobehub/fluent-emoji-3d@latest/assets/{h}.webp",
            f"https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/{h}/3D/{h}_3d.png"
        ]
        
        for url in urls:
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=8) as resp:
                    if resp.status == 200:
                        data = resp.read()
                        if len(data) > 200:
                            with open(out_file, 'wb') as fp:
                                fp.write(data)
                            return (True, h, False)
            except Exception:
                pass
        return (False, h, False)

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(download_one, all_emojis))

    for ok, h, is_skip in results:
        if ok:
            if is_skip:
                skipped += 1
            else:
                success += 1
        else:
            failed.append(h)

    print(f"Hoàn thành tải 3D! Tải mới: {success}, Đã có sẵn: {skipped}, Chưa tìm thấy: {len(failed)}")
    # Tạo manifest danh sách 3D đã có
    installed = [f.replace('.webp', '') for f in os.listdir(target_dir) if f.endswith('.webp')]
    with open(os.path.join(target_dir, 'manifest.json'), 'w', encoding='utf-8') as f:
        import json
        json.dump(installed, f, indent=2)
    print(f"Đã lưu manifest với {len(installed)} biểu tượng 3D sẵn sàng!")

if __name__ == '__main__':
    main()
