#!/usr/bin/env python3
"""Generate solid-color placeholder PNG icons for the extension (stdlib only)."""
import struct
import zlib
import pathlib

SIZES = (16, 48, 128)
COLOR = (0x1F, 0x75, 0xCB, 0xFF)  # GitLab-ish blue, RGBA
OUT_DIR = pathlib.Path(__file__).resolve().parent.parent / "icons"


def make_png(size: int) -> bytes:
    row = bytes(COLOR) * size
    raw = b"".join(b"\x00" + row for _ in range(size))  # filter byte 0 per row
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
