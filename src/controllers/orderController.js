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
  if (!body.dataCriacao) return "O campo dataCriacao é obrigatorio.";
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

async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;

    const orderResult = await pool.query(
      `SELECT 
      o.*,
      i."productId",
      i."quantity",
      i."price"
      FROM "Order" o 
      LEFT JOIN "Items" i ON i."orderId" = o."orderId" 
      WHERE o."orderId" = $1`,
      [orderId],
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "pedido não encontrado" });
    }

    const order = {
      ...orderResult.rows[0],
      items: orderResult.rows
        .filter((rows) => rows.productId !== null)
        .map(({ productId, quantity, price }) => ({
          productId,
          quantity,
          price,
        })),
    };
    return res.status(200).json(order);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Erro interno do servidor", error: err.message });
  }
}

module.exports = {
  createOrder,
  getOrderById,
};
