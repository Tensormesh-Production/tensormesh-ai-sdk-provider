import {
  getAvailableModelIds,
  getDefaultModelIds,
} from "../../../lib/tensormesh";

export const maxDuration = 30;

export async function GET() {
  const models = await getAvailableModelIds();

  return Response.json({
    models,
    defaults: getDefaultModelIds(),
  });
}
