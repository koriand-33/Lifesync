export const horas24 = Array.from({ length: 24 }, (_, i) =>
  `${i.toString().padStart(2, '0')}:00`,
);
