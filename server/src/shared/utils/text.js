export const normalizeText = (value = '') => {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
};

export const includesKeyword = (value = '', keyword = '') => {
  return normalizeText(value).includes(normalizeText(keyword));
};

export const makeTournamentShortName = (name = '') => {
  const cleaned = String(name)
    .replace(/LIGA\s+PHOENIX\s+\d{4}\s*-\s*/i, '')
    .trim();

  return cleaned || name;
};
