const { createOrder, getOrders } = require("../service/order");
const { DateTime } = require('luxon');

exports.createOrderController = async (req, res) => {
  const user = req.user;
  const email = user.email;

  const { name, date, status, amount } = req.body;

  if (!name || !date || !amount || !status || typeof amount !== "number") {
    return res
      .status(400)
      .send(
        "Invalid request: Please provide name, date, amount (number), and userEmail"
      );
  }

  const data = await createOrder(email, req.body);
  console.log(data)

  res.status(200).json({ message: "Order Created"});
};

exports.getOrderByDays = async (req, res) => {
  const user = req.user;
  const email = user.email;
  console.log(email);
  const {
    customStartDate,
    customEndDate,
    days,
    status
  } = req.query;

  if (days) {
    const now = DateTime.now();
    const daysAgo = now.minus({ days: +days });
    const startDate = daysAgo.toJSDate();
    const endDate = now.toJSDate();
    
    await getOrders(
      email,
      startDate,
      endDate,
      status,
      res
    );
  } else {
    const startDate = DateTime.fromISO(customStartDate).toJSDate();
    const endDate = DateTime.fromISO(customEndDate).toJSDate();
    await getOrders(
      email,
      startDate,
      endDate,
      status,
      res
    );
  }
};
