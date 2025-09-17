import { httpInterceptor } from 'src/helpers/httpInterceptor';
import fetchMock from 'fetch-mock';

describe('httpInterceptor', () => {
  describe('get', () => {
    afterEach(() => {
      fetchMock.restore();
    });

    it('should return response when status is 200', async () => {
      fetchMock.mock('/someUrl', { data: { id: 1 } });
      const res = await httpInterceptor.get('/someUrl');
      expect(fetchMock.calls().matched).toHaveLength(1);
      expect(res.data.id).toBe(1);
    });

    it('should throw an error when status is not 2xx', async () => {
      fetchMock.mock('/someUrl', 404);
      await expect(httpInterceptor.get('/someUrl')).rejects.toMatchObject({
        response: { status: 404 }
      });
    });
  });
});
