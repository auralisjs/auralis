import { AuralisFactory } from "@auralis/core";

async function bootstrap() {
  const app = await AuralisFactory.create();

  await app.listen(4000);
  console.log("Auralis is running on http://localhost:4000");
}

await bootstrap();
