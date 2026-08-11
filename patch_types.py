import re

with open('src/types/index.ts', 'r') as f:
    content = f.read()

new_types = """
export type DayWorkingHours = {
  isOff: boolean;
  startTime: string;
  endTime: string;
};

export type WeeklyWorkingHours = {
  0: DayWorkingHours;
  1: DayWorkingHours;
  2: DayWorkingHours;
  3: DayWorkingHours;
  4: DayWorkingHours;
  5: DayWorkingHours;
  6: DayWorkingHours;
};
"""

content = content.replace("export type PaymentCycle", new_types + "\nexport type PaymentCycle")
content = content.replace("  workingHours: {", "  weeklyWorkingHours?: WeeklyWorkingHours;\n  workingHours: {")

with open('src/types/index.ts', 'w') as f:
    f.write(content)

with open('src/data/initialData.ts', 'r') as f:
    initial = f.read()

new_working_hours = """
  weeklyWorkingHours: {
    0: { isOff: true, startTime: '09:00', endTime: '21:00' },
    1: { isOff: false, startTime: '09:00', endTime: '21:00' },
    2: { isOff: false, startTime: '09:00', endTime: '21:00' },
    3: { isOff: false, startTime: '09:00', endTime: '21:00' },
    4: { isOff: false, startTime: '09:00', endTime: '21:00' },
    5: { isOff: false, startTime: '09:00', endTime: '21:00' },
    6: { isOff: false, startTime: '09:00', endTime: '21:00' },
  },
  workingHours: {"""
initial = initial.replace("  workingHours: {", new_working_hours)

with open('src/data/initialData.ts', 'w') as f:
    f.write(initial)

print("Updated types and initial data")
