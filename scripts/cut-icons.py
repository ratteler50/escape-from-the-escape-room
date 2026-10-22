"""cut-icons.py SHEET SIZE OUTDIR [HOLES] -- cut every object off an icon sheet into square icons.

Removes the flat background by flood fill from the edges (like cut-sprite.py), finds each object
(parts close together count as one), orders them left to right in rows, and saves each centred in a
SIZE x SIZE transparent square as OUTDIR/NN.png, numbered in sheet order from 01.

HOLES lists the icons (e.g. "1,5,13") whose enclosed background-coloured gaps are see-through too:
inside a keyring or a mug handle. It's opt-in because a grey part of an object (an envelope's
window) looks the same.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

sheet, size, outdir = sys.argv[1], int(sys.argv[2]), sys.argv[3]
with_holes = {int(i) for i in sys.argv[4].split(',')} if len(sys.argv) > 4 else set()
a = np.asarray(Image.open(sheet).convert('RGB')).astype(np.float32)
key = np.median(np.array([a[2, 2], a[2, -3], a[-3, 2], a[-3, -3]]), axis=0)
dist = np.sqrt(((a - key) ** 2).sum(axis=2))
labels, _ = ndimage.label(dist < 30)
border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
bg = np.isin(labels, list(border))
# Enclosed background (inside a keyring): flat and close to the key. Used only for `with_holes`.
n = labels.max()
means = ndimage.mean(dist, labels, index=np.arange(1, n + 1))
sizes = ndimage.sum(np.ones_like(dist), labels, index=np.arange(1, n + 1))
holes = np.isin(labels, [i + 1 for i in range(n) if sizes[i] > 10 and means[i] < 25 and (i + 1) not in border])


def cut_out(bg):
    alpha = np.where(bg, 0.0, 1.0)
    ring = ndimage.binary_dilation(bg) & ~bg
    alpha[ring] = np.clip(dist / 70.0, 0.0, 1.0)[ring]
    k = alpha[..., None]
    rgb = np.where(k > 0, (a - (1 - k) * key) / np.maximum(k, 1e-3), 0)
    return np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)


rgba, rgba_holes = cut_out(bg), cut_out(bg | holes)
alpha = rgba[..., 3] / 255.0

# Objects: foreground grown a little so a lanyard's strap and badge count as one.
objects, n = ndimage.label(ndimage.binary_dilation(alpha > 0.1, iterations=12))
boxes = [s for s in ndimage.find_objects(objects) if (s[0].stop - s[0].start) * (s[1].stop - s[1].start) > 2000]
rows = []
for b in sorted(boxes, key=lambda s: (s[0].start + s[0].stop) / 2):
    cy = (b[0].start + b[0].stop) / 2
    if rows and abs(cy - rows[-1][0]) < a.shape[0] / 6:
        rows[-1][1].append(b)
    else:
        rows.append([cy, [b]])
ordered = [b for _, row in rows for b in sorted(row, key=lambda s: s[1].start)]
for i, (ys, xs) in enumerate(ordered, 1):
    piece = (rgba_holes if i in with_holes else rgba)[ys, xs]
    m = piece[..., 3] > 25
    yy, xx = np.nonzero(m)
    piece = piece[yy.min():yy.max() + 1, xx.min():xx.max() + 1]
    im = Image.fromarray(piece, 'RGBA')
    scale = size / max(im.size)
    im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
    out.save(f'{outdir}/{i:02d}.png')
print(f'{len(ordered)} icons from {sheet}')
