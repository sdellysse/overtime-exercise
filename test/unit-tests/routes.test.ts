import routes, { _forTests as routes_forTests } from "../../src/routes";
import * as db from "../../src/db";
import express from "express";

describe("routes", () => {
  beforeEach(() => (routes_forTests.store.handle = db.getInitialHandle()));

  describe("GET /users", () => {
    it("should json users", async () => {
      const req = {};
      const res = {
        json: jest.fn(),
      };

      await routes["GET /users"](
        req as unknown as express.Request,
        res as unknown as express.Response
      );

      expect(res.json).toHaveBeenCalledWith(
        await db.getUsers({ handle: routes_forTests.store.handle })
      );
    });
  });

  describe("GET /users/:id", () => {
    it("should json user", async () => {
      const req = {
        params: {
          id: "carl",
        },
      };
      const res = {
        json: jest.fn(),
        sendStatus: jest.fn(),
      };

      await routes["GET /users/:id"](
        req as unknown as express.Request,
        res as unknown as express.Response
      );

      expect(res.json).toHaveBeenCalledWith(
        await db.getUserById({
          handle: routes_forTests.store.handle,
          id: req.params.id,
        })
      );
      expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it("should 404 non-user", async () => {
      const req = {
        params: {
          id: "sheen",
        },
      };
      const res = {
        json: jest.fn(),
        sendStatus: jest.fn(),
      };

      await routes["GET /users/:id"](
        req as unknown as express.Request,
        res as unknown as express.Response
      );

      expect(res.json).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledWith(404);
    });
  });

  describe("PATCH /users/:id", () => {
    it("should 404 on bad id", async () => {
      const req = {
        params: {
          id: "sheen",
        },
      };
      const res = {
        sendStatus: jest.fn(),
      };

      await routes["PATCH /users/:id"](
        req as unknown as express.Request,
        res as unknown as express.Response
      );

      expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    it("should 400 on bad action", async () => {
      const req = {
        params: {
          id: "carl",
        },
        body: {
          action: "jump",
        },
      };
      const res = {
        sendStatus: jest.fn(),
      };

      await routes["PATCH /users/:id"](
        req as unknown as express.Request,
        res as unknown as express.Response
      );

      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    describe("view", () => {
      it("should increment view counter", async () => {
        const req = {
          params: {
            id: "carl",
          },
          body: {
            action: "view",
          },
        };
        const res = {
          sendStatus: jest.fn(),
        };

        await routes["PATCH /users/:id"](
          req as unknown as express.Request,
          res as unknown as express.Response
        );

        expect(res.sendStatus).toHaveBeenCalledWith(200);
        expect(
          JSON.parse(routes_forTests.store.handle).usersById.carl.viewCount
        ).toBe(1);
      });
    });

    describe("follow", () => {
      it("should 200 on valid other id", async () => {
        const req = {
          params: {
            id: "carl",
          },
          body: {
            action: "follow",
            user_id: "hugh",
          },
        };
        const res = {
          sendStatus: jest.fn(),
        };

        await routes["PATCH /users/:id"](
          req as unknown as express.Request,
          res as unknown as express.Response
        );

        expect(res.sendStatus).toHaveBeenCalledWith(200);
        expect(
          JSON.parse(routes_forTests.store.handle).usersById.carl.followingIds
        ).toEqual(["jimmy", "hugh"]);
      });

      it("should 406 on invalid other id", async () => {
        const req = {
          params: {
            id: "carl",
          },
          body: {
            action: "follow",
            user_id: "sheen",
          },
        };
        const res = {
          sendStatus: jest.fn(),
        };

        await routes["PATCH /users/:id"](
          req as unknown as express.Request,
          res as unknown as express.Response
        );

        expect(res.sendStatus).toHaveBeenCalledWith(406);
      });
    });

    describe("unfollow", () => {
      it("should 200 on valid other id", async () => {
        const req = {
          params: {
            id: "carl",
          },
          body: {
            action: "unfollow",
            user_id: "jimmy",
          },
        };
        const res = {
          sendStatus: jest.fn(),
        };

        await routes["PATCH /users/:id"](
          req as unknown as express.Request,
          res as unknown as express.Response
        );

        expect(res.sendStatus).toHaveBeenCalledWith(200);
        expect(
          JSON.parse(routes_forTests.store.handle).usersById.carl.followingIds
        ).toEqual([]);
      });

      it("should 406 on invalid other id", async () => {
        const req = {
          params: {
            id: "carl",
          },
          body: {
            action: "unfollow",
            user_id: "sheen",
          },
        };
        const res = {
          sendStatus: jest.fn(),
        };

        await routes["PATCH /users/:id"](
          req as unknown as express.Request,
          res as unknown as express.Response
        );

        expect(res.sendStatus).toHaveBeenCalledWith(406);
      });
    });
  });
});