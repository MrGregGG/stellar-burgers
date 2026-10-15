import { fetchWithRefresh, refreshToken } from './burger-api';
import { clearTokens } from './session';
import { getCookie, setCookie } from './cookie';
// The app runs in a browser; jsdom needs a standards-compatible Headers implementation.
const { Headers: FetchHeaders } = jest.requireActual('node-fetch');
Object.assign(global, { Headers: FetchHeaders });
const response = (data: unknown, ok = true) =>
  ({ ok, json: async () => data }) as Response;
let fetchMock: jest.Mock;
beforeEach(() => {
  clearTokens();
  fetchMock = jest.fn();
  global.fetch = fetchMock;
});
test('expired access token is refreshed once for concurrent requests', async () => {
  setCookie('accessToken', 'Bearer old');
  localStorage.setItem('refreshToken', 'refresh');
  fetchMock
    .mockResolvedValueOnce(response({ message: 'jwt expired' }, false))
    .mockResolvedValueOnce(response({ message: 'jwt expired' }, false))
    .mockResolvedValueOnce(
      response({
        success: true,
        accessToken: 'Bearer new',
        refreshToken: 'next'
      })
    )
    .mockResolvedValue(response({ success: true, value: 42 }));
  const [a, b] = await Promise.all([
    fetchWithRefresh('/private', { headers: { authorization: 'Bearer old' } }),
    fetchWithRefresh('/private', { headers: { authorization: 'Bearer old' } })
  ]);
  expect(a).toEqual({ success: true, value: 42 });
  expect(b).toEqual(a);
  expect(
    fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/auth/token'))
  ).toHaveLength(1);
  expect(getCookie('accessToken')).toBe('Bearer new');
  expect(fetchMock.mock.calls[3][1].headers.get('authorization')).toBe(
    'Bearer new'
  );
});
test('missing access token with refresh token restores the session before requesting', async () => {
  localStorage.setItem('refreshToken', 'refresh');
  fetchMock
    .mockResolvedValueOnce(
      response({
        success: true,
        accessToken: 'Bearer restored',
        refreshToken: 'next'
      })
    )
    .mockResolvedValueOnce(response({ success: true }));
  await fetchWithRefresh('/private', {});
  expect(fetchMock.mock.calls[0][0]).toContain('/auth/token');
  expect(fetchMock.mock.calls[1][1].headers.get('authorization')).toBe(
    'Bearer restored'
  );
});
test('failed refresh clears credentials and emits session-expired', async () => {
  setCookie('accessToken', 'Bearer old');
  localStorage.setItem('refreshToken', 'bad');
  const expire = jest.fn();
  window.addEventListener('session-expired', expire);
  fetchMock
    .mockResolvedValueOnce(response({ message: 'jwt expired' }, false))
    .mockResolvedValueOnce(
      response({ success: false, message: 'invalid token' }, false)
    );
  await expect(fetchWithRefresh('/private', {})).rejects.toEqual(
    expect.objectContaining({ message: 'invalid token' })
  );
  expect(expire).toHaveBeenCalledTimes(1);
  expect(getCookie('accessToken')).toBeUndefined();
  expect(localStorage.getItem('refreshToken')).toBeNull();
  window.removeEventListener('session-expired', expire);
});
test('late refresh cannot restore credentials after logout', async () => {
  localStorage.setItem('refreshToken', 'refresh');
  let resolve!: (response: Response) => void;
  fetchMock.mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      })
  );
  const pending = refreshToken();
  clearTokens();
  resolve(
    response({ success: true, accessToken: 'late', refreshToken: 'late' })
  );
  await expect(pending).rejects.toThrow('Сессия завершена');
  expect(getCookie('accessToken')).toBeUndefined();
});
test('ordinary server errors are not retried as authentication failures', async () => {
  fetchMock.mockResolvedValue(
    response({ success: false, message: 'server unavailable' }, false)
  );
  await expect(fetchWithRefresh('/private', {})).rejects.toEqual(
    expect.objectContaining({ message: 'server unavailable' })
  );
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
