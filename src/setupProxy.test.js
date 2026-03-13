const setupProxy = require("./setupProxy");

describe("buildProxyFetchOptions", () => {
  test("keeps the original method and follows redirects", () => {
    expect(
      setupProxy.buildProxyFetchOptions("GET", { Accept: "application/json" }),
    ).toEqual({
      method: "GET",
      headers: { Accept: "application/json" },
      body: undefined,
      redirect: "follow",
    });

    expect(
      setupProxy.buildProxyFetchOptions(
        "POST",
        { "Content-Type": "application/json" },
        Buffer.from("{}"),
      ),
    ).toEqual({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: Buffer.from("{}"),
      redirect: "follow",
    });
  });
});