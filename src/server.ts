import app from './app.js';
import dotenv from 'dotenv';
import * as process from 'node:process';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
