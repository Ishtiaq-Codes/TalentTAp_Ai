import os
import re

directory = r"c:\Users\user\OneDrive\Desktop\FYP(SaaS)\frontend\src\pages"

count = 0
for root, dirs, files in os.walk(directory):
    if "landing" in root:
        continue
    for file in files:
        if file.endswith(".jsx"):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            
            # Simple replacements
            new_content = new_content.replace("rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow", "glass-card rounded-2xl p-5")
            new_content = new_content.replace("rounded-2xl border bg-white shadow-sm", "glass-card rounded-2xl")
            new_content = new_content.replace("rounded-xl border border-slate-200 bg-white shadow-sm", "glass-card rounded-xl")
            new_content = new_content.replace("rounded-xl border bg-white shadow-sm", "glass-card rounded-xl")
            
            # Regex 1: rounded-(xl|2xl) border [border-slate-X] bg-white [p-X] shadow-sm
            new_content = re.sub(
                r'rounded-(xl|2xl) border(?: border-slate-\d+)? bg-white (p-[\d\.]+ )?shadow-sm', 
                r'glass-card rounded-\1 \2', 
                new_content
            )
            
            # Regex 2: border bg-white [rounded-X] [p-X] shadow-sm
            new_content = re.sub(
                r'border(?: border-slate-\d+)? bg-white (rounded-(?:xl|2xl|lg) )?(p-[\d\.]+ )?shadow-sm', 
                r'glass-card \1\2', 
                new_content
            )
            
            # Regex 3: bg-white [rounded-X] border shadow-sm
            new_content = re.sub(
                r'bg-white (rounded-(?:xl|2xl|lg) )?border(?: border-slate-\d+)? (p-[\d\.]+ )?shadow-sm', 
                r'glass-card \1\2', 
                new_content
            )
            
            # Cleanup double spaces
            new_content = new_content.replace("  ", " ").replace(' "', '"').replace('" ', '"')
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file}")
                count += 1

print(f"Total files updated: {count}")
