import { app, setupApp } from "../server/app";

let serverPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  if (!serverPromise) {
    serverPromise = setupApp(app);
  }
  await serverPromise;

  app(req, res);
}
