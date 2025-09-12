import { httpInterceptor } from "src/helpers/httpInterceptor";
import fetchMock from "fetch-mock";

describe("httpInterceptor", () => {
  describe("get", () => {
    afterEach(() => {
      fetchMock.restore();
    });

    it("should return response when status is 200", (done) => {
      fetchMock.mock("/someUrl", { data: { id: 1 } });
      httpInterceptor.get("/someUrl").then((res) => {
        expect(fetchMock.calls().matched.length).toBe(1);
        expect(res.data.id).toBe(1);
        done();
      });
    });

    it("should throw an error when status is not 2xx", (done) => {
      fetchMock.mock("/someUrl", 404);
      httpInterceptor
        .get("/someUrl")
        .then(() => {})
        .catch((err) => {
          expect(err.response.status).toBe(404);
          done();
        });
    });
  });
});
