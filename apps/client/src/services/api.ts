import { BASE_URL } from '@/constants/app';
import type {
  GenericResponse,
  GetPageResponse,
  IDiagram,
  QRCodeRequestBody,
  QRCodeResponse,
  SharePageRequestBody,
  SharePageResponse,
  UpdatePageRequestBody,
  UpdatePageResponse,
} from 'shared';

type QueryReturn<D> = {
  data: D | null;
  error: HTTPError | null;
};

class HTTPError extends Error {}

const createQuery = (
  baseUrl: RequestInfo | URL = '',
  baseInit?: RequestInit,
) => {
  return async <D>(
    url: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<QueryReturn<D>> => {
    try {
      const res = await fetch(`${baseUrl}${url}`, { ...baseInit, ...init });

      if (!res.ok) {
        return res.json();
      }

      const data = await res.json();

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as HTTPError };
    }
  };
};

const query = createQuery(BASE_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
});

const makeRequest = (method: RequestInit['method']) => {
  return <TResponse = unknown, TBody = Record<string, unknown>>(
    url: RequestInfo | URL,
    body: TBody,
  ) => {
    return query<TResponse>(url, { method, body: JSON.stringify(body) });
  };
};

// delete request
const deleteRequest = <TResponse = unknown>(url: RequestInfo | URL) => {
  return query<TResponse>(url, { method: 'DELETE' });
};

const api = {
  get: query,
  post: makeRequest('POST'),
  patch: makeRequest('PATCH'),
  delete: deleteRequest,
  put: makeRequest('PUT'),
};

export default {
  getPage: (pageId: string, init?: RequestInit) => {
    return api.get<GetPageResponse>(`/p/${pageId}`, init);
  },
  updatePage: (pageId: string, body: UpdatePageRequestBody) => {
    return api.patch<UpdatePageResponse>(`/p/${pageId}`, body);
  },
  sharePage: (body: SharePageRequestBody) => {
    return api.post<SharePageResponse>('/p', body);
  },
  makeQRCode: (body: QRCodeRequestBody) => {
    return api.post<QRCodeResponse>('/qrcode', body);
  },

  // Diagrams
  getDiagrams: (init?: RequestInit) => {
    return api.get<GenericResponse<IDiagram[]>>('/diagrams', init);
  },
  getDiagram: (diagramId: string, init?: RequestInit) => {
    return api.get<GenericResponse<IDiagram>>(`/diagrams/${diagramId}`, init);
  },
  deleteDiagram: (diagramId: string) => {
    return api.delete<GenericResponse<string>>(`/diagrams/${diagramId}`);
  },
  updateDiagram: (diagramId: string, body: UpdatePageRequestBody) => {
    return api.put<GenericResponse<{ id: string }>>(
      `/diagrams/${diagramId}`,
      body,
    );
  },
  createDiagram: (body: UpdatePageRequestBody & { name: string }) => {
    return api.post<GenericResponse<IDiagram>>(`/diagrams`, body);
  },
};
