import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});