export const serializeFormData = (formData: FormData): unknown => {
  const response: unknown = {};

  for (const key of formData.keys()) {
    response[key] = formData.get(key);
  }

  return response;
};
