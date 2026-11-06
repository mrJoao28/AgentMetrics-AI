"""Evaluate a JSONL file from the command line."""

import argparse
import json
from pathlib import Path

from .evaluation import evaluate


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate conversational AI outputs")
    parser.add_argument("dataset", type=Path, help="JSONL file with labeled outputs")
    args = parser.parse_args()
    with args.dataset.open(encoding="utf-8") as stream:
        records = [json.loads(line) for line in stream if line.strip()]
    print(json.dumps(evaluate(records), indent=2))


if __name__ == "__main__":
    main()
