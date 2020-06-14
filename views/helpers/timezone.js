export const correctISOTime = (date) => {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  return (new Date(date - tzoffset)).toISOString().replace(/:(\d+).(\d+)Z$/, '');
};

export const getDate = (date) => {
  if (date instanceof Date === false) date = new Date(date);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}`;
};

export const getTime = (date) => {
  if (date instanceof Date === false) date = new Date(date);
  return `${date.getHours().toString().padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}`;
}