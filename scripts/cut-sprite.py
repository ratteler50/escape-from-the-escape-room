"""cut.py IN X Y W H HEIGHT OUT.png -- cut a character off a flat background.

Removes the background by flood fill from the crop's edges (plus large, flat background-coloured
holes, e.g. between an arm and the body), so light colours inside the figure survive. Trims to the
figure and scales it to 2x HEIGHT (sprites are stored at twice their on-screen size).
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

src, x, y, w, h, height, out = sys.argv[1], *map(int, sys.argv[2:7]), sys.argv[7]
img = Image.open(src).convert('RGB').crop((x, y, x + w, y + h))
a = np.asarray(img).astype(np.float32)
corners = np.array([a[2, 2], a[2, -3], a[-3, 2], a[-3, -3]])
key = np.median(corners, axis=0)
dist = np.sqrt(((a - key) ** 2).sum(axis=2))
like = dist < 30
labels, n = ndimage.label(like)
border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
bg = np.isin(labels, list(border))
# Enclosed background: big and flat (mean distance to the key small).
sizes = ndimage.sum(np.ones_like(dist), labels, index=np.arange(1, n + 1))
means = ndimage.mean(dist, labels, index=np.arange(1, n + 1))
holes = [i + 1 for i in range(n) if sizes[i] > 300 and means[i] < 10 and (i + 1) not in border]
bg |= np.isin(labels, holes)
alpha = np.where(bg, 0.0, 1.0)
# Soften a one-pixel ring next to the background, and pull the key colour out of it.
ring = ndimage.binary_dilation(bg) & ~bg
soft = np.clip(dist / 70.0, 0.0, 1.0)
alpha[ring] = soft[ring]
rgb = a.copy()
k = alpha[..., None]
rgb = np.where(k > 0, (a - (1 - k) * key) / np.maximum(k, 1e-3), 0)
rgba = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
ys, xs = np.nonzero(alpha > 0.1)
rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
im = Image.fromarray(rgba, 'RGBA')
target = height * 2
im = im.resize((round(im.width * target / im.height), target), Image.LANCZOS)
im.save(out)
print(out, im.size, 'key', key.round(), 'holes', len(holes))
