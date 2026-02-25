import { randomBytes } from 'crypto';

export const generateId = () => {
  return randomBytes(16).toString('hex');
};

export const parseJSON = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

export const stringifyJSON = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch {
    return '[]';
  }
};

export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};


