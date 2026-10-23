"""walk-pose-guide.py OUT.png [marker] -- draws a 7-pose walk guide for ChatGPT: standing, then a full two-step cycle.

Near limbs orange (in front), far limbs blue (behind), so the legs visibly take turns; words alone
didn't get an alternating cycle out of the generator (slice 27). With `marker`, the near leg is lime
green (Dana's green-sock leg in the round-5 prompt) and the far leg brown. Needs Pillow.
"""
import math, sys
from PIL import Image, ImageDraw
W, H, N = 1536, 1024, 7
NEAR, FAR, BODY = (235, 120, 30), (40, 90, 200), (110, 110, 110)
NEAR_ARM, FAR_ARM = NEAR, FAR
if sys.argv[2:] == ['marker']:
    NEAR, FAR, NEAR_ARM, FAR_ARM = (120, 210, 40), (120, 85, 45), (150, 150, 150), (90, 90, 90)
THIGH = SHIN = 150
# (near thigh, near knee, far thigh, far knee, bob) in degrees, thigh positive = forward (right); knee bends the shin back
STEP = [(24, 0, -20, 12, 10), (12, 18, -24, 35, 18), (0, 0, 10, 50, 0)]
POSES = [(0, 0, 0, 0, 0)] + STEP + [(f, fk, n, nk, b) for (n, nk, f, fk, b) in STEP]
im = Image.new('RGB', (W, H), (205, 205, 205))
d = ImageDraw.Draw(im)
def limb(hip, thigh, knee, colour, width):
    a = math.radians(thigh)
    k = (hip[0] + THIGH * math.sin(a), hip[1] + THIGH * math.cos(a))
    b = math.radians(thigh - knee)
    f = (k[0] + SHIN * math.sin(b), k[1] + SHIN * math.cos(b))
    d.line([hip, k, f], fill=colour, width=width, joint='curve')
    d.line([f, (f[0] + 40, f[1])], fill=colour, width=width)  # the foot points forward
def arm(sh, angle, colour, width):
    a = math.radians(angle)
    e = (sh[0] + 110 * math.sin(a), sh[1] + 110 * math.cos(a))
    h = (e[0] + 100 * math.sin(a + 0.25), e[1] + 100 * math.cos(a + 0.25))
    d.line([sh, e, h], fill=colour, width=width, joint='curve')
for i, (nt, nk, ft, fk, bob) in enumerate(POSES):
    cx = W * (i + 0.5) / N
    ground = 900
    lift = THIGH * (1 - math.cos(math.radians(max(abs(nt), abs(ft))))) + bob * 0.3
    hip = (cx, ground - THIGH - SHIN + lift)
    sh = (cx + 6, hip[1] - 210)
    arm((sh[0] + 10, sh[1]), -0.8 * nt, FAR_ARM, 16)        # far arm swings with the near leg's opposite
    limb((hip[0] + 10, hip[1]), ft, fk, FAR, 22)
    d.line([hip, sh], fill=BODY, width=34)
    d.ellipse([sh[0] - 45, sh[1] - 140, sh[0] + 45, sh[1] - 40], outline=BODY, width=10)
    limb(hip, nt, nk, NEAR, 26)
    arm(sh, -0.8 * ft, NEAR_ARM, 18)
im.save(sys.argv[1])
