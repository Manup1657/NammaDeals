#!/usr/bin/env python3
"""
fetch_manual_products.py — placeholder
Copies manual_products.json forward.
"""

import shutil
src = "manual_products.json"
dst = "manual_products.json"
shutil.copyfile(src, dst)
print("Manual products retained.")