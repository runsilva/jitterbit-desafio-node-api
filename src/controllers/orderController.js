function mapOrderInput(body) {
  return {
    orderId: body.numeroPedido,
    value: body.valorTotal,
    creationDate: body.dataCriacao,
    items: body.items.map((item) => ({
      productId: item.idItem,
      quantity: item.quantidadeItem,
      price: item.valorItem,
    })),
  };
}

function validateOrderBody(body) {
  if (!body.numeroPedido) return "O campo numeroPedido é obrigatorio.";
  if (!body.valorTotal) return "O campo valorTotal é obrigatorio.";
  if (!body.dataCriacao) return "O campo dataPedido é obrigatorio.";
  if (!body.items || !Array.isArray(body.items))
    return "O campo items é obrigatorio e deve ser um array.";
  return null;
}

const pool = require("../database/db");

async function createOrder(req, res) {
  try {
    const error = validateOrderBody(req.body);
    if (error) return res.status(400).json({ message: error });

    const { orderId, value, creationDate, items } = mapOrderInput(req.body);

    await pool.query(
      `INSERT INTO "Order" ("orderId", "value", "creationDate") VALUES ($1,$2,$3)`,
      [orderId, value, creationDate],
    );

    for (const item of items) {
      await pool.query(
        `INSERT INTO "Items" ("orderId", "productId", "quantity", "price") VALUES ($1,$2,$3,$4)`,
        [orderId, item.productId, item.quantity, item.price],
      );
    }
    return res.status(201).json({ orderId, value, creationDate, items });
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "Pedido com esse numero já existe." });
    }
    return res
      .status(500)
      .json({ message: "Erro interno do servidor", error: err.message });
  }
}
module.exports = {
  createOrder,
};
