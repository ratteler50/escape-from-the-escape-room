"""make-tray.py SHEET OUTDIR -- the inventory tray and slot frame from the tray sheet (slice 21).

The sheet has a long tray (plain left end and middle, logo and sticker at the right) above one
square slot, on a flat background. The tray is stretched to 2560 x 180 (2x the 1280 x 90 bar) by
widening its plain middle, so the rounded ends, logo and sticker keep their shape. The slot is cut
out at 152 x 152 (2x 76).
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

sheet, outdir = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(sheet).convert('RGB')).astype(np.float32)
key = np.median(np.array([a[2, 2], a[2, -3], a[-3, 2], a[-3, -3]]), axis=0)
dist = np.sqrt(((a - key) ** 2).sum(axis=2))
labels, _ = ndimage.label(dist < 30)
border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
bg = np.isin(labels, list(border))
alpha = np.where(bg, 0.0, 1.0)
ring = ndimage.binary_dilation(bg) & ~bg
alpha[ring] = np.clip(dist / 70.0, 0.0, 1.0)[ring]
# Stray background-grey pixels along the long edges (the outline and rim are far from it).
alpha[dist < 45] = 0
k = alpha[..., None]
rgb = np.where(k > 0, (a - (1 - k) * key) / np.maximum(k, 1e-3), 0)
rgba = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)

objects, _ = ndimage.label(alpha > 0.1)
pieces = sorted(ndimage.find_objects(objects), key=lambda s: -(s[0].stop - s[0].start) * (s[1].stop - s[1].start))[:2]
tray, slot = sorted(pieces, key=lambda s: s[0].start)  # the tray is above the slot

t = rgba[tray]
h, w = t.shape[:2]
# Keep each end (a quarter of the tray each: the left's rounded end, the right's logo and sticker);
# fill between with copies of a plain column from the middle.
left, right = t[:, : w // 4], t[:, w - w * 7 // 24:]
target_w = round(2560 * h / 180)
middle = np.repeat(t[:, w // 2: w // 2 + 1], target_w - left.shape[1] - right.shape[1], axis=1)
bar = np.asarray(Image.fromarray(np.concatenate([left, middle, right], axis=1), 'RGBA').resize((2560, 180), Image.LANCZOS)).copy()
# Background grey left in the outermost rows (anti-aliasing against the sheet): clear it, so no light
# hairline shows above or below the tray's dark outline.
edge = np.r_[0:3, 177:180]
px = bar[edge].astype(np.float32)
grey = (px[..., :3].max(axis=2) > 70) & (np.ptp(px[..., :3], axis=2) < 25)
bar[edge, :, 3] = np.where(grey, 0, bar[edge, :, 3])
bar = Image.fromarray(bar, 'RGBA')
bar.save(f'{outdir}/tray.png')

s = Image.fromarray(rgba[slot], 'RGBA').resize((152, 152), Image.LANCZOS)
s.save(f'{outdir}/slot.png')
print('tray', (w, h), '-> 2560x180; slot', rgba[slot].shape[1::-1], '-> 152x152')
