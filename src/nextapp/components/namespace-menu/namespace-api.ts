export interface NamespaceData {
  id: string;
  name: string;
}

export const getNamespaces = async (): Promise<NamespaceData[]> => {
  try {
    const response = await fetch('/gw/api/namespaces');
    const json = await response.json();

    if (!response.ok) {
      throw response.statusText;
    }

    return json;
  } catch (err) {
    throw new Error(err);
  }
};

export const createNamespace = async (payload: {
  name: string;
}): Promise<NamespaceData> => {
  try {
    const response = await fetch('/api/namespaces', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: JSON.stringify({ name: payload.name }),
    });
    const json = await response.json();

    if (!response.ok) {
      throw response.statusText;
    }

    return json;
  } catch (err) {
    throw new Error(err);
  }
};
