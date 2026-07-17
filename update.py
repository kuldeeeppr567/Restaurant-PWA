import re

def update_css():
    with open('src/index.css', 'r') as f:
        css = f.read()

    # Step 1: Add variables to :root
    root_vars = """
  --surface-base: linear-gradient(160deg, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.56));
  --surface-nav: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.7));
  --surface-sidebar: linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.58));
  --surface-row: rgba(255, 255, 255, 0.62);
  --surface-row-hover: rgba(255, 255, 255, 0.65);
  --surface-btn-secondary: rgba(255, 255, 255, 0.66);
  --surface-receipt: rgba(255, 255, 255, 0.94);
  --surface-billing: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(79, 70, 229, 0.1));
  --surface-billing-border: rgba(255, 255, 255, 0.3);
  --surface-category: linear-gradient(160deg, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0.58));
  
  --glass-mask-gradient: linear-gradient(150deg, rgba(255, 255, 255, 0.9), rgba(147, 51, 234, 0.16) 40%, transparent 70%);
  --glass-mask-sidebar: linear-gradient(160deg, rgba(255, 255, 255, 0.9), rgba(147, 51, 234, 0.28) 45%, transparent 70%);
  --border-item: rgba(148, 163, 184, 0.18);
  --border-item-hover: rgba(79, 70, 229, 0.28);
  --row-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  --btn-glow: linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0) 45%);
  --role-icon-bg: radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.44), rgba(var(--role-color), 0.16) 58%, rgba(var(--role-color), 0.28));
  --role-icon-shadow: inset 0 0 14px rgba(255, 255, 255, 0.35);
  --status-tint-base: rgba(255,255,255,0.74);
"""
    # Insert variables in :root
    css = re.sub(r'(:root\s*\{)', r'\1\n' + root_vars, css)

    # Step 2: Add variables to [data-theme='dark']
    dark_vars = """
  --surface-base: linear-gradient(160deg, rgba(24, 31, 51, 0.74), rgba(15, 23, 42, 0.56));
  --surface-nav: linear-gradient(180deg, rgba(24, 31, 51, 0.82), rgba(15, 23, 42, 0.7));
  --surface-sidebar: linear-gradient(180deg, rgba(24, 31, 51, 0.78), rgba(15, 23, 42, 0.58));
  --surface-row: rgba(24, 31, 51, 0.62);
  --surface-row-hover: rgba(30, 41, 59, 0.65);
  --surface-btn-secondary: rgba(30, 41, 59, 0.66);
  --surface-receipt: rgba(15, 23, 42, 0.94);
  --surface-billing: linear-gradient(145deg, rgba(24, 31, 51, 0.82), rgba(79, 70, 229, 0.1));
  --surface-billing-border: rgba(148, 163, 184, 0.2);
  --surface-category: linear-gradient(160deg, rgba(30, 38, 61, 0.76), rgba(20, 26, 44, 0.58));
  
  --glass-mask-gradient: linear-gradient(150deg, rgba(148, 163, 184, 0.2), rgba(147, 51, 234, 0.15) 40%, transparent 70%);
  --glass-mask-sidebar: linear-gradient(160deg, rgba(148, 163, 184, 0.25), rgba(147, 51, 234, 0.2) 45%, transparent 70%);
  --border-item: rgba(148, 163, 184, 0.15);
  --border-item-hover: rgba(129, 140, 248, 0.4);
  --row-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  --btn-glow: linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0) 45%);
  --role-icon-bg: radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.1), rgba(var(--role-color), 0.16) 58%, rgba(var(--role-color), 0.28));
  --role-icon-shadow: inset 0 0 14px rgba(255, 255, 255, 0.05);
  --status-tint-base: rgba(15, 23, 42, 0.74);
"""
    css = re.sub(r'(\[data-theme=\'dark\'\]\s*\{)', r'\1\n' + dark_vars, css)

    # Step 3: Replace hardcoded strings
    replacements = {
        "background: linear-gradient(160deg, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0.56));": "background: var(--surface-base);",
        "background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.7));": "background: var(--surface-nav);",
        "background: linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.58));": "background: var(--surface-sidebar);",
        "background: rgba(255, 255, 255, 0.62);": "background: var(--surface-row);",
        "background: rgba(255, 255, 255, 0.65);": "background: var(--surface-row-hover);",
        "background: rgba(255, 255, 255, 0.66);": "background: var(--surface-btn-secondary);",
        "background: rgba(255, 255, 255, 0.94);": "background: var(--surface-receipt);",
        "background: linear-gradient(145deg, rgba(255, 255, 255, 0.82), rgba(79, 70, 229, 0.1));": "background: var(--surface-billing);",
        "background: linear-gradient(160deg, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0.58));": "background: var(--surface-category);",
        
        "background: linear-gradient(150deg, rgba(255, 255, 255, 0.9), rgba(147, 51, 234, 0.16) 40%, transparent 70%);": "background: var(--glass-mask-gradient);",
        "background: linear-gradient(160deg, rgba(255, 255, 255, 0.9), rgba(147, 51, 234, 0.28) 45%, transparent 70%);": "background: var(--glass-mask-sidebar);",
        
        "border: 1px solid rgba(148, 163, 184, 0.18);": "border: 1px solid var(--border-item);",
        "border-color: rgba(79, 70, 229, 0.28);": "border-color: var(--border-item-hover);",
        "box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);": "box-shadow: var(--row-shadow);",
        
        "background: linear-gradient(180deg, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0) 45%);": "background: var(--btn-glow);",
        "background: radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.44), rgba(var(--role-color), 0.16) 58%, rgba(var(--role-color), 0.28));": "background: var(--role-icon-bg);",
        "inset 0 0 14px rgba(255, 255, 255, 0.35)": "var(--role-icon-shadow)",
        "border: 1px solid rgba(255, 255, 255, 0.3);": "border: 1px solid var(--surface-billing-border);",
        
        "linear-gradient(160deg, rgba(255,255,255,0.74), ": "linear-gradient(160deg, var(--status-tint-base), "
    }

    for old, new in replacements.items():
        css = css.replace(old, new)
        
    # Remove existing dark mode overrides that we no longer need or replace them
    # like [data-theme='dark'] .menu-category
    
    with open('src/index.css', 'w') as f:
        f.write(css)

update_css()
