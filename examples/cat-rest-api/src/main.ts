import { app } from "./app.ts";

async function bootstrap() {
  await app.listen(4115);
  console.log(`Auralis is running on ${app.getUrl()}`);
}

await bootstrap();
