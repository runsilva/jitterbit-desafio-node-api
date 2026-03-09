const express = require("express");
const app = express();
const orderRoutes = require("./src/routes/orderRoutes");
const errorHandler = require("./src/middlewares/errorHandler");

app.use(express.json());
app.use("/", orderRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
