export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  return phone && !isNaN(phone) && phone.toString().length >= 10;
};

export const validateGender = (gender) => {
  return ['M', 'F'].includes(gender?.toString().toUpperCase());
};

export const validateName = (name) => {
  return typeof name === 'string' && name.trim().length > 0;
};