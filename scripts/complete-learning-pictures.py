"""Bundle missing Fluent 3D pictures with their MIT license; never substitute unrelated art."""
import json, urllib.request, urllib.parse, io
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
names = {
    '1f441': 'Eye', '2602': 'Umbrella', '2600': 'Sun', '1f327': 'Cloud with rain',
    '1f32c': 'Wind face', '2601': 'Cloud', '1f344': 'Mushroom', '1f43c': 'Panda',
    '1f38b': 'Tanabata tree', '2744': 'Snowflake', '1f9e5': 'Coat', '1f319': 'Crescent moon',
    '1f6cf': 'Bed', '1f4a7': 'Droplet', '1f954': 'Potato', '2708': 'Airplane',
    '1f6a2': 'Ship', '270f': 'Pencil', '1f4cf': 'Straight ruler', '1f392': 'Backpack',
    '1f58d': 'Crayon', '1f37d': 'Fork and knife with plate', '1f963': 'Bowl with spoon',
    '1f41b': 'Bug', '1f98b': 'Butterfly', '1fa81': 'Kite', '1fa80': 'Yo-yo',
    '2668': 'Hot springs', '1faa3': 'Bucket', '1f590': 'Hand with fingers splayed',
    '1f9fc': 'Soap', '1fa73': 'Shorts', '1f440': 'Eyes', '1f5d1': 'Wastebasket',
    '2702': 'Scissors', '267b': 'Recycling symbol', '26d1': 'Rescue workers helmet',
    '1f9d1-200d-2695': 'Health worker', '1f9d1-200d-2708': 'Pilot',
    '1f41d': 'Honeybee', '1f41e': 'Lady beetle', '1f41c': 'Ant', '1faba': 'Nest with eggs',
    '1f36f': 'Honey pot', '1f5bc': 'Framed picture', '1f3ab': 'Ticket', '1f3de': 'National park',
    '1f7e4': 'Brown circle', '1f304': 'Sunrise over mountains', '1f48c': 'Love letter',
    '1f4ee': 'Postbox', '1f468-200d-1f469-200d-1f467': 'Family man woman girl',
    '1f5e3': 'Speaking head', '1f6cd': 'Shopping bags', '1f681': 'Helicopter',
    '1f6e3': 'Motorway', '1f9d1-200d-1f91d-200d-1f9d1': 'People holding hands',
    '1f330': 'Chestnut', '1f9fb': 'Roll of paper', '1f9e4': 'Gloves',
    '1f524': 'Input latin letters',
}
def read(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'BeVuiHoc-curriculum-build'})
    return urllib.request.urlopen(request, timeout=40).read()

tree_path = ROOT / 'review/fluent-asset-tree.json'
if not tree_path.exists():
    tree_path.write_bytes(read('https://api.github.com/repos/microsoft/fluentui-emoji/git/trees/main?recursive=1'))
tree = json.loads(tree_path.read_text(encoding='utf-8'))['tree']
paths = [row['path'] for row in tree if '/3D/' in row['path'] and row['path'].endswith('.png')]
raw = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/'
sources = []
def bundle(pair):
    code, name = pair
    target = ROOT / f'public/assets/3d/{code}.webp'
    if target.exists(): return None
    candidates = [path for path in paths if path.split('/')[1].lower() == name.lower()]
    if not candidates: return {'code': code, 'error': 'No original asset: ' + name}
    # Neutral/default variant first, never an arbitrary different emoji.
    candidates.sort(key=lambda path: ('Default' not in path, len(path)))
    source = candidates[0]
    try:
        image = Image.open(io.BytesIO(read(raw + urllib.parse.quote(source, safe='/')))).convert('RGBA')
        image.save(target, 'WEBP', quality=90)
        return {'code': code, 'source': source, 'dimensions': image.size}
    except Exception as error:
        return {'code': code, 'error': str(error)}
with ThreadPoolExecutor(max_workers=5) as workers:
    for result in workers.map(bundle, names.items()):
        if result: sources.append(result); print(json.dumps(result, ensure_ascii=False), flush=True)
(ROOT / 'public/assets/3d/FLUENT-LICENSE.txt').write_bytes(read(raw + 'LICENSE'))
(ROOT / 'review/added-picture-sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding='utf-8')
