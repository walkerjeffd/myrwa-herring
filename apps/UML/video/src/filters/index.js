/* eslint-disable import/prefer-default-export */

export function number(value) {
  // console.log('filter:number', value);
  return Math.round(value).toLocaleString();
}

export function datetime(value) {
  // console.log('filter:datetime', value);
  if (typeof value === 'string') {
    value = new Date(value); // eslint-disable-line no-param-reassign
  }
  return value.toLocaleString();
}
