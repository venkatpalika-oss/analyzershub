#!/usr/bin/env python3
"""Run: python3 scripts/check-isolation.py (requires Git, no packages).

Scan tracked and non-ignored untracked text files for direct infrastructure
coupling. Editorial links to instmates.com are allowed. This file alone is
excluded because its patterns describe forbidden infrastructure. This is a
source check, not an IAM boundary or a detector of obfuscated/dynamic targets.
"""

import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SELF = Path(__file__).resolve()
PROJECT = r"instmates(?:-[a-z0-9-]+)?"
RULES = [
    ("Firebase endpoint", rf"(?:[a-z0-9-]+-)?{PROJECT}\.(?:cloudfunctions\.net|firebaseapp\.com|web\.app|firebaseio\.com|appspot\.com|firebasestorage\.app)\b"),
    ("Cloud resource", rf"(?:projects/|gs://|/b/){PROJECT}(?:[/\s\"'?]|$)"),
    ("Project setting", rf"[\"']?(?:project(?:Id|_id|-id)?|GOOGLE_CLOUD_PROJECT|GCLOUD_PROJECT|FIREBASE_PROJECT(?:_ID)?)[\"']?\s*[:=]\s*[\"']?{PROJECT}(?=[\s\"',;}}]|$)"),
    ("CLI target", rf"(?:--project(?:[=\s]+)|firebase\s+use\s+)[\"']?{PROJECT}(?=[\s\"';]|$)"),
    ("Service identity", rf"@{PROJECT}\.iam\.gserviceaccount\.com\b"),
    ("API origin", r"https?://(?:api|app)\.instmates\.com\b"),
]
PATTERNS = [(label, re.compile(pattern, re.I)) for label, pattern in RULES]


def violations(path, text):
    findings = []
    if path.name == ".firebaserc":
        try:
            projects = json.loads(text).get("projects", {})
            if not isinstance(projects, dict):
                raise ValueError("projects must be an object")
            if any(re.fullmatch(PROJECT, str(value), re.I)
                   for value in projects.values()):
                findings.append((1, "Firebase project alias"))
        except (ValueError, AttributeError):
            findings.append((1, "Unparseable Firebase project configuration"))
    for number, line in enumerate(text.splitlines(), 1):
        for label, pattern in PATTERNS:
            if pattern.search(line):
                findings.append((number, label))
    return findings


def main():
    names = subprocess.check_output(
        ["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
        cwd=ROOT,
    ).decode().split("\0")
    failed = False
    checked = 0
    for name in sorted(set(filter(None, names))):
        path = ROOT / name
        if path.resolve() == SELF or not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if "\0" in text:
            continue
        checked += 1
        for number, label in violations(path, text):
            # Do not print source lines: a violation may contain credentials.
            print(f"FAIL {name}:{number}: {label}")
            failed = True
    print(f"{'FAIL' if failed else 'PASS'}: isolation check; {checked} text files scanned")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
