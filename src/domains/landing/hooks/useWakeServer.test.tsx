import { render } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/server";
import { useWakeServer } from "./useWakeServer";

const baseUrl = import.meta.env.VITE_API_URL || "/api";

const Probe = () => {
  useWakeServer();

  return null;
};

const listenForPings = () => {
  const pings: string[] = [];

  server.use(
    http.get(`${baseUrl}/`, ({ request }) => {
      pings.push(request.url);

      return HttpResponse.json({ message: "pong" });
    }),
  );

  return pings;
};

describe("Given the landing page is opened", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("When it loads for the first time in the session, Then it pings the server once", async () => {
    const pings = listenForPings();

    render(<Probe />);

    await vi.waitFor(() => expect(pings).toHaveLength(1));
  });

  it("When it loads again in the same session, Then it does not ping again", async () => {
    const pings = listenForPings();

    const { unmount } = render(<Probe />);
    await vi.waitFor(() => expect(pings).toHaveLength(1));
    unmount();
    render(<Probe />);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(pings).toHaveLength(1);
  });

  it("When the server is unreachable, Then nothing breaks", async () => {
    server.use(http.get(`${baseUrl}/`, () => HttpResponse.error()));

    expect(() => render(<Probe />)).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
});
