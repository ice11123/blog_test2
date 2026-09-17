#!/usr/bin/env python3
"""Create a read-only inventory of an embedded project.

The script reports structure and likely evidence entry points. It does not read
file contents, follow directory symlinks, or claim that discovered files are
part of the active build.
"""

from __future__ import annotations

import argparse
import json
import os
from collections import Counter
from pathlib import Path


EXCLUDED_DIRS = {
    ".git",
    ".idea",
    ".pio",
    ".venv",
    ".vscode",
    "debug",
    "release",
    "build",
    "dist",
    "node_modules",
    "out",
}

SOURCE_EXTENSIONS = {
    ".a51",
    ".asm",
    ".c",
    ".cc",
    ".cpp",
    ".cxx",
    ".h",
    ".hpp",
    ".inc",
    ".s",
}

CONFIG_NAMES = {
    ".cproject",
    ".project",
    "cmakelists.txt",
    "makefile",
    "platformio.ini",
}

CONFIG_EXTENSIONS = {
    ".cfg",
    ".cmd",
    ".ioc",
    ".ld",
    ".sct",
    ".syscfg",
    ".uvoptx",
    ".uvprojx",
    ".yml",
    ".yaml",
}

DOC_EXTENSIONS = {".md", ".pdf", ".txt", ".doc", ".docx"}
ASSET_EXTENSIONS = {".bmp", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="只读盘点嵌入式工程结构与潜在证据入口。"
    )
    parser.add_argument("root", type=Path, help="工程根目录")
    parser.add_argument(
        "--max-largest",
        type=int,
        default=15,
        help="最多列出多少个体积最大的相关文件（默认 15）",
    )
    return parser.parse_args()


def classify(path: Path) -> str:
    name = path.name.lower()
    suffix = path.suffix.lower()
    if suffix in SOURCE_EXTENSIONS:
        return "source"
    if name in CONFIG_NAMES or suffix in CONFIG_EXTENSIONS:
        return "config"
    if suffix in DOC_EXTENSIONS:
        return "document"
    if suffix in ASSET_EXTENSIONS:
        return "asset"
    return "other"


def is_evidence_entry(path: Path) -> bool:
    name = path.name.lower()
    suffix = path.suffix.lower()
    return (
        name in CONFIG_NAMES
        or suffix in CONFIG_EXTENSIONS
        or name.startswith("startup_")
        or name.startswith("system_")
        or name in {"readme", "readme.md", "readme.txt"}
    )


def relative_text(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def inventory(root: Path, max_largest: int) -> dict[str, object]:
    root = root.resolve(strict=True)
    if not root.is_dir():
        raise NotADirectoryError(f"不是目录：{root}")

    counts: Counter[str] = Counter()
    extensions: Counter[str] = Counter()
    evidence_entries: list[str] = []
    excluded: list[str] = []
    relevant_sizes: list[tuple[int, str, str]] = []
    unreadable: list[str] = []

    for current, dirs, files in os.walk(root, followlinks=False):
        current_path = Path(current)
        kept_dirs: list[str] = []
        for directory in sorted(dirs):
            candidate = current_path / directory
            rel = relative_text(candidate, root)
            if directory.lower() in EXCLUDED_DIRS or candidate.is_symlink():
                excluded.append(rel)
            else:
                kept_dirs.append(directory)
        dirs[:] = kept_dirs

        for filename in sorted(files):
            path = current_path / filename
            if path.is_symlink():
                excluded.append(relative_text(path, root))
                continue

            category = classify(path)
            counts[category] += 1
            suffix = path.suffix.lower() or "<无扩展名>"
            extensions[suffix] += 1
            rel = relative_text(path, root)

            if is_evidence_entry(path):
                evidence_entries.append(rel)

            if category in {"source", "config", "document"}:
                try:
                    relevant_sizes.append((path.stat().st_size, rel, category))
                except OSError:
                    unreadable.append(rel)

    largest = sorted(relevant_sizes, reverse=True)[:max(0, max_largest)]
    return {
        "root": str(root),
        "notice": "发现文件不等于当前构建启用；请继续核对活动配置与调用链。",
        "counts_by_category": dict(sorted(counts.items())),
        "top_extensions": dict(extensions.most_common(20)),
        "evidence_entry_candidates": sorted(evidence_entries),
        "largest_relevant_files": [
            {"path": rel, "bytes": size, "category": category}
            for size, rel, category in largest
        ],
        "excluded_paths": sorted(excluded),
        "unreadable_paths": sorted(unreadable),
    }


def main() -> int:
    args = parse_args()
    try:
        report = inventory(args.root, args.max_largest)
    except (FileNotFoundError, NotADirectoryError, OSError) as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False, indent=2))
        return 2

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
