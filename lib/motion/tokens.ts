export const spring = {
  snappy:  { type: 'spring', stiffness: 500, damping: 35, mass: 0.7 } as const,  // buttons, toggles, chips
  smooth:  { type: 'spring', stiffness: 300, damping: 30, mass: 0.9 } as const,  // cards, drawers
  gentle:  { type: 'spring', stiffness: 180, damping: 24, mass: 1.1 } as const,  // page-level, hero moments
};

export const ease = {
  standard: [0.4, 0, 0.2, 1] as const,
  exit:     [0.4, 0, 1, 1] as const,
  enter:    [0, 0, 0.2, 1] as const,
};

export const duration = {
  micro:  0.15,
  standard: 0.25,
  macro:  0.35,
  hero:   0.6,
};
