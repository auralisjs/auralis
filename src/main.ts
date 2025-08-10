import { AuralisFactory } from "./common/auralis.factory.ts";

async function bootstrap() {
  const app = await AuralisFactory.create();

  await app.listen(4000);
  console.log("Auralis is running on http://localhost:4000");
}

bootstrap();
