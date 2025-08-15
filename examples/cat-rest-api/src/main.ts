import { AuralisFactory } from "@auralis/core";

async function bootstrap() {
  const app = await AuralisFactory.create();

  await app.listen(4115);
  console.log(`Auralis is running on ${app.getUrl()}`);
}

await bootstrap();
