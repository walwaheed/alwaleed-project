from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/alwaleed-photo-assistant/assets/images')
for source in root.glob('product-*.jpg'):
    image = Image.open(source).convert('RGB')
    image.thumbnail((1200, 900), Image.Resampling.LANCZOS)
    image.save(source, quality=72, optimize=True, progressive=True)
    print(f'compressed {source.name}: {source.stat().st_size} bytes')
