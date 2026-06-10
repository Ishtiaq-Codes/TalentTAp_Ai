import os

files = [r'apps\matching\engine.py', r'apps\interviews\services.py']
for path in files:
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace('model_name="gemini-2.5-flash"', 'model_name="llama-3.1-8b-instant"')
    new_content = new_content.replace("model_name='gemini-2.5-flash'", 'model_name="llama-3.1-8b-instant"')
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {path}')
    else:
        print(f'No changes for {path}')
