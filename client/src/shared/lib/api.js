const API_URL = import.meta.env.VITE_API_URL || '';

const buildHeaders = (customHeaders = {}, hasBody = false) => {
  const headers = { ...customHeaders };

  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

export const apiRequest = async (path, options = {}) => {
  const { method = 'GET', body, headers = {} } = options;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders(headers, body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Error en la solicitud');
  }

  return data;
};

export const apiGet = (path, headers = {}) => {
  return apiRequest(path, { method: 'GET', headers });
};

export const apiPost = (path, body, headers = {}) => {
  return apiRequest(path, { method: 'POST', body, headers });
};

export const apiPut = (path, body, headers = {}) => {
  return apiRequest(path, { method: 'PUT', body, headers });
};

export const apiPatch = (path, body, headers = {}) => {
  return apiRequest(path, { method: 'PATCH', body, headers });
};