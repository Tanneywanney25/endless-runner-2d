#!/usr/bin/env python3
"""Generate a deterministic obstacle pattern for the endless runner.

The game (and the Vitest suite) load the emitted JSON. The generator uses a
plain LCG so the same seed always yields the same pattern on any platform —
no reliance on Python's random module internals.

Usage:
    python scripts/gen_obstacles.py [--seed 20260925] [--count 64]
        [--min-gap 280] [--max-gap 560] [--types 6]
        [--out public/patterns/default.json]
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

# Numerical Recipes LCG constants — stable, well understood.
LCG_A = 1664525
LCG_C = 1013904223
LCG_M = 2**32


def lcg(seed: int):
    """Yield an endless stream of floats in [0, 1)."""
    state = seed % LCG_M
    while True:
        state = (LCG_A * state + LCG_C) % LCG_M
        yield state / LCG_M


def generate(seed: int, count: int, min_gap: int, max_gap: int, types: int) -> dict:
    rand = lcg(seed)
    entries = []
    for _ in range(count):
        gap = min_gap + int(next(rand) * (max_gap - min_gap + 1))
        obstacle_type = 1 + int(next(rand) * types)
        entries.append({"gap": gap, "type": obstacle_type})
    return {"seed": seed, "entries": entries}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=20260925)
    parser.add_argument("--count", type=int, default=64)
    parser.add_argument("--min-gap", type=int, default=280)
    parser.add_argument("--max-gap", type=int, default=560)
    parser.add_argument("--types", type=int, default=6)
    parser.add_argument("--out", type=Path, default=Path("public/patterns/default.json"))
    args = parser.parse_args()

    if args.min_gap <= 0 or args.max_gap < args.min_gap:
        parser.error("require 0 < min-gap <= max-gap")
    if args.types < 1:
        parser.error("types must be >= 1")

    pattern = generate(args.seed, args.count, args.min_gap, args.max_gap, args.types)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(pattern, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {args.out} ({len(pattern['entries'])} entries, seed {pattern['seed']})")


if __name__ == "__main__":
    main()
