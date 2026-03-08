const express = require("express");
const app = express();
const orderRoutes = require("./src/routes/orderRoutes");

app.use(express.json());
app.use("/", orderRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
