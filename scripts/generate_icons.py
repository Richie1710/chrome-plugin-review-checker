#!/usr/bin/env python3
"""Generate the extension's PNG icons: an anti-aliased teal rounded-square
badge with a white checkmark, drawn with a small signed-distance rasterizer
(stdlib only: struct + zlib + math — no image libraries, no external assets).
"""
import math
import pathlib
import struct
import zlib

SIZES = (16, 48, 128)
BG = (15, 139, 141)  # #0F8B8D — the options page's teal accent
FG = (255, 255, 255)  # white checkmark
OUT_DIR = pathlib.Path(__file__).resolve().parent.parent / "icons"


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def rounded_rect_sdf(x: float, y: float, w: float, h: float, r: float) -> float:
    qx = abs(x) - (w / 2 - r)
    qy = abs(y) - (h / 2 - r)
    return math.hypot(max(qx, 0.0), max(qy, 0.0)) + min(max(qx, qy), 0.0) - r


def seg_dist(px: float, py: float, ax: float, ay: float, bx: float, by: float) -> float:
    abx, aby = bx - ax, by - ay
    apx, apy = px - ax, py - ay
    denom = abx * abx + aby * aby
    t = 0.0 if denom == 0 else max(0.0, min(1.0, (apx * abx + apy * aby) / denom))
    cx, cy = ax + t * abx, ay + t * aby
    return math.hypot(px - cx, py - cy)


def make_png(size: int) -> bytes:
    corner_radius = size * 0.22
    stroke_width = max(1.6, size * 0.115)
    # Checkmark as two segments (short leg + long leg), in pixel coordinates.
    p1 = (size * 0.27, size * 0.53)
    p2 = (size * 0.44, size * 0.70)
    p3 = (size * 0.76, size * 0.32)

    rows = []
    for j in range(size):
        row = bytearray([0])  # filter byte: none
        for i in range(size):
            cx, cy = i + 0.5 - size / 2, j + 0.5 - size / 2
            bg_cov = clamp01(0.5 - rounded_rect_sdf(cx, cy, size, size, corner_radius))

            d_ck = min(
                seg_dist(i + 0.5, j + 0.5, *p1, *p2),
                seg_dist(i + 0.5, j + 0.5, *p2, *p3),
            )
            ck_cov = clamp01(stroke_width / 2 + 0.5 - d_ck)

            r = BG[0] * (1 - ck_cov) + FG[0] * ck_cov
            g = BG[1] * (1 - ck_cov) + FG[1] * ck_cov
            b = BG[2] * (1 - ck_cov) + FG[2] * ck_cov
            a = 255 * bg_cov

            row += bytes([round(r), round(g), round(b), round(a)])
        rows.append(bytes(row))

    raw = b"".join(rows)
    compressed = zlib.compress(raw, 9)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b"")


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    for size in SIZES:
        path = OUT_DIR / f"icon{size}.png"
        path.write_bytes(make_png(size))
        print(f"wrote {path}")


if __name__ == "__main__":
    main()
