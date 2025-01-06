export const generatePin = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const validatePin = (inputPin: string, storedPin?: string): boolean => {
  return storedPin !== undefined && inputPin === storedPin;
};