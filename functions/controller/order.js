const { createOrder, getOrders } = require("../service/order");
const moment = require("moment");

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
    activeStatus,
    completedStatus,
  } = req.query;

  if (days) {
    const now = new Date();
    const daysAgo = moment().subtract(+days, "days");
    const startDate = daysAgo.toDate();
    const endDate = now;
    await getOrders(
      email,
      startDate,
      endDate,
      activeStatus,
      completedStatus,
      res
    );
  } else {
    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);
    await getOrders(
      email,
      startDate,
      endDate,
      activeStatus,
      completedStatus,
      res
    );
  }
};
