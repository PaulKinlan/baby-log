export default function(date) {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  return (new Date(date - tzoffset)).toISOString().replace(/:(\d+).(\d+)Z$/, '');
}