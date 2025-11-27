#!/usr/bin/env python3
import json, datetime, pathlib

OUT = pathlib.Path("bestsellers.json")

def main():
  data = {
    "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
    "items": []
  }
  OUT.write_text(json.dumps(data, indent=2), encoding="utf-8")
  print("bestsellers.json refreshed")

if __name__ == "__main__":
  main()