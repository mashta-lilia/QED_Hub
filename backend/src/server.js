import { createApp } from './app.js';
import { getConfig } from './config.js';

const config = getConfig();
const server = await createApp({ config });

server.listen(config.port, () => {
  console.log(`QED Hub backend listening on http://localhost:${config.port}`);
});
