const API_URL = import.meta.env.VITE_API_URL || '';
export const apiGet = async (path) => {
const response = await fetch(`${API_URL}${path}`);
if (!response.ok) {
const error = await response.json().catch(() => null);
throw new Error(error?.message || 'Error en la solicitud');
}
return response.json();
};
