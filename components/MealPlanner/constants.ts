import type { BacklogRecipe, MealRow, WeekDay } from './types';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

const formatIso = (date: Date) => date.toISOString().slice(0, 10);

export const buildWeekDays = (weekStart: Date): WeekDay[] =>
  WEEKDAY_LABELS.map((label, idx) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + idx);
    const iso = formatIso(date);
    return {
      key: iso,
      label,
      dateLabel: formatDateLabel(date),
      iso,
    };
  });

export const MEAL_ROWS: MealRow[] = [
  { key: 'breakfast', label: 'Breakfast', hint: 'Light, quick fuel' },
  { key: 'lunch', label: 'Lunch', hint: 'Midday energy' },
  { key: 'snack', label: 'Snack', hint: 'Prep-ahead nibbles' },
  { key: 'dinner', label: 'Dinner', hint: 'Hearty + family friendly' },
];

export const RECIPE_BACKLOG: BacklogRecipe[] = [
  {
    id: 'r1',
    name: 'Lemon herb chicken',
    meal: 'dinner',
    duration: '35 min',
    tags: ['Protein', 'Low effort'],
  },
  {
    id: 'r2',
    name: 'Smoky veggie tacos',
    meal: 'lunch',
    duration: '25 min',
    tags: ['Veggie', 'Batch'],
  },
  {
    id: 'r3',
    name: 'Overnight oats',
    meal: 'breakfast',
    duration: '10 min',
    tags: ['Make-ahead', 'High fiber'],
  },
  {
    id: 'r4',
    name: 'Chili crisp noodles',
    meal: 'dinner',
    duration: '20 min',
    tags: ['Spicy', 'Fast'],
  },
  {
    id: 'r5',
    name: 'Greek yogurt bowls',
    meal: 'snack',
    duration: '5 min',
    tags: ['Snack', 'High protein'],
  },
];
