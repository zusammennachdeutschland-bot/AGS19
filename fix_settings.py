import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

old_array = """              {[
                { id: 'blue' as const, hex: '#3b82f6', color: 'blue' },
                { id: 'green' as const, hex: '#16a34a', color: 'green' },
                { id: 'purple' as const, hex: '#9333ea', color: 'purple' },
                { id: 'orange' as const, hex: '#ea580c', color: 'orange' },
                { id: 'red' as const, hex: '#dc2626', color: 'red' },
                { id: 'teal' as const, hex: '#0d9488', color: 'teal' },
                { id: 'indigo' as const, hex: '#4f46e5', color: 'indigo' },
              ]"""

new_array = """              {[
                { id: 'blue' as const, hex: '#3b82f6', color: 'blue' },
                { id: 'indigo' as const, hex: '#6366f1', color: 'indigo' },
                { id: 'violet' as const, hex: '#8b5cf6', color: 'violet' },
                { id: 'purple' as const, hex: '#a855f7', color: 'purple' },
                { id: 'fuchsia' as const, hex: '#d946ef', color: 'fuchsia' },
                { id: 'rose' as const, hex: '#f43f5e', color: 'rose' },
                { id: 'red' as const, hex: '#ef4444', color: 'red' },
                { id: 'orange' as const, hex: '#f97316', color: 'orange' },
                { id: 'amber' as const, hex: '#f59e0b', color: 'amber' },
                { id: 'green' as const, hex: '#22c55e', color: 'green' },
                { id: 'emerald' as const, hex: '#10b981', color: 'emerald' },
                { id: 'teal' as const, hex: '#14b8a6', color: 'teal' },
                { id: 'cyan' as const, hex: '#06b6d4', color: 'cyan' },
                { id: 'slate' as const, hex: '#64748b', color: 'slate' },
              ]"""

content = content.replace(old_array, new_array)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
