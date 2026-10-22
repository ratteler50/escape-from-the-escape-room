"""overlay.py BG EDITED X Y W H OUT.png PREVIEW.png -- turn an edited, enlarged crop into an overlay.

Scales the edit back to W x H, finds where it differs from the background's X Y W H region, crops
to that (padded), and feathers the edges so the patch blends into the painting.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

bg_path, edit_path, x, y, w, h, out, preview = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:7]), sys.argv[7], sys.argv[8]
bg = Image.open(bg_path).convert('RGB')
region = np.asarray(bg.crop((x, y, x + w, y + h))).astype(np.float32)
edit = np.asarray(Image.open(edit_path).convert('RGB').resize((w, h), Image.LANCZOS)).astype(np.float32)
diff = np.sqrt(((edit - region) ** 2).sum(axis=2))
# Changed: a clear difference, cleaned of speckle by a blur.
changed = np.asarray(Image.fromarray((diff > 40).astype(np.uint8) * 255).filter(ImageFilter.MedianFilter(5))) > 0
ys, xs = np.nonzero(changed)
pad = 8
x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, w)
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, h)
# Alpha: the changed area, grown and blurred, so the edges fade into the painting.
mask = Image.fromarray(changed.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(3))
patch = Image.fromarray(edit.astype(np.uint8)).convert('RGBA')
patch.putalpha(mask)
patch = patch.crop((x0, y0, x1, y1))
patch.save(out)
full = bg.convert('RGBA')
full.alpha_composite(patch, (x + x0, y + y0))
full.convert('RGB').save(preview)
print(f'{out}: at ({x + x0}, {y + y0}) size {patch.size}; mean diff outside change {diff[~changed].mean():.1f}')
