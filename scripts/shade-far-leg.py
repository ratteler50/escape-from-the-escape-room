"""shade-far-leg.py IN.png OUT.png -- shades the far leg darker in each walk frame, so the legs alternate: frames 1-3 the screen-left leg,
frames 4-6 the screen-right leg. The legs are split at the crotch (the lowest point where the trousers
are still one piece); above it, the split follows the crotch's column and fades out towards the hips.

Slice 27: every generator drew the same leg leading both steps, so the tone tells the legs apart
instead. IN is the aligned walk strip (221-px cells, standing pose first). Needs Pillow and numpy.
"""
import sys
import numpy as np
from PIL import Image
W, DARK, FADE = 221, 0.58, 40
im = np.asarray(Image.open(sys.argv[1])).astype(np.float32)
out = im.copy()
for i in range(1, 7):
    c = im[:, W * i:W * (i + 1)]
    a = c[..., 3] > 100
    R, G, B = c[..., 0], c[..., 1], c[..., 2]
    khaki = a & (R > 120) & (G > 100) & (B < 140) & (R - B > 30)
    H = c.shape[0]
    # The crotch: scanning up from the feet, the first row where the opaque figure in the leg zone is one run.
    def runs(y):
        xs = np.nonzero(a[y, 30:W - 30])[0] + 30
        if len(xs) == 0: return []
        cuts = np.nonzero(np.diff(xs) > 3)[0]
        return np.split(xs, cuts + 1)
    y = H - 40
    while y > H * 0.45 and len(runs(y)) >= 2: y -= 1
    crotch_y = y
    rs = runs(crotch_y + 3)
    gap_x = (rs[0][-1] + rs[1][0]) / 2 if len(rs) >= 2 else W / 2
    xs = np.arange(W)[None, :]
    ys = np.arange(H)[:, None]
    side = xs < gap_x if i <= 3 else xs >= gap_x
    weight = np.clip((ys - (crotch_y - FADE)) / FADE, 0, 1)  # 0 above the fade, 1 below the crotch
    mask = (side & a) * weight
    # Only the trousers and shoes: below the crotch everything on that side is leg.
    mask = np.where(ys >= crotch_y, side & a, mask * khaki)
    k = 1 - (1 - DARK) * mask
    out[:, W * i:W * (i + 1), :3] = c[..., :3] * k[..., None]
    print(i, 'crotch', crotch_y, 'gap', round(gap_x))
Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(sys.argv[2])
