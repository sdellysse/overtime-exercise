import * as express from "express";
import * as db from "./db";

// export for testing
const store = {
  handle: db.getInitialHandle(),
};

const routes = <const>{
  "GET /users": async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    const users = await db.getUsers({ handle: store.handle });

    res.json(users);
  },

  "GET /users/:id": async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    const user = await db.getUserById({
      handle: store.handle,
      id: req.params.id,
    });
    if (user === null) {
      res.sendStatus(404);
      return;
    }

    res.json(user);
  },

  "PATCH /users/:id": async (
    req: express.Request,
    res: express.Response
  ): Promise<void> => {
    const user = await db.getUserById({
      handle: store.handle,
      id: req.params.id,
    });
    if (user === null) {
      res.sendStatus(404);
      return;
    }

    if (req.body.action === "view") {
      store.handle = await db.setUser({
        handle: store.handle,
        user: {
          ...user,
          viewCount: user.viewCount + 1,
        },
      });

      res.sendStatus(200);
      return;
    }

    if (req.body.action === "follow") {
      const otherUser = await db.getUserById({
        handle: store.handle,
        id: req.body.user_id,
      });
      if (otherUser === null) {
        res.sendStatus(406);
        return;
      }

      store.handle = await db.setUser({
        handle: store.handle,
        user: {
          ...user,
          followingIds: [
            ...user.followingIds.filter((id) => id !== otherUser.id),
            otherUser.id,
          ],
        },
      });

      res.sendStatus(200);
      return;
    }

    if (req.body.action === "unfollow") {
      if (
        user.followingIds.find((id) => id === req.body.user_id) === undefined
      ) {
        res.sendStatus(406);
        return;
      }

      store.handle = await db.setUser({
        handle: store.handle,
        user: {
          ...user,
          followingIds: user.followingIds.filter(
            (id) => id !== req.body.user_id
          ),
        },
      });

      res.sendStatus(200);
      return;
    }

    res.sendStatus(400);
  },
};

export default routes;

export const _forTests = {
  store,
};
