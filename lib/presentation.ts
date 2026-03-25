export function getPersonCoverStyle(seed: string) {
  const variants = [
    'linear-gradient(135deg, rgba(16,44,92,0.96), rgba(27,88,167,0.84)), radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 38%)',
    'linear-gradient(135deg, rgba(13,42,87,0.96), rgba(198,161,74,0.75)), radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 42%)',
    'linear-gradient(135deg, rgba(18,55,104,0.96), rgba(86,124,188,0.82)), radial-gradient(circle at center right, rgba(255,255,255,0.14), transparent 40%)',
    'linear-gradient(135deg, rgba(28,63,120,0.96), rgba(11,30,64,0.88)), radial-gradient(circle at top center, rgba(198,161,74,0.18), transparent 38%)'
  ];
  const idx = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % variants.length;
  return { backgroundImage: variants[idx] };
}

export function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join('');
}
