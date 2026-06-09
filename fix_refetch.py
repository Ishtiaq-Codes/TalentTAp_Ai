import os
import re

directory = r"c:\Users\user\OneDrive\Desktop\FYP(SaaS)\frontend\src\pages"

count = 0
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".jsx"):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = re.sub(r'\brefetch\(\)', 'refetch(true)', content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file}")
                count += 1

print(f"Total files updated: {count}")
