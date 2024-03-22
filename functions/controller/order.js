const orderCollection = "orders";
const admin = require("firebase-admin");
const { createOrder, getOrders, filterOrder } = require("../service/order");
const moment = require("moment");

exports.createOrderController = async (req, res) => {
  const user = req.user;
  const email = user.email;
  const firestore = admin.firestore();

  const { name, date, amount } = req.body;

  if (!name || !date || !amount || typeof amount !== "number") {
    return res
      .status(400)
      .send(
        "Invalid request: Please provide name, date, amount (number), and userEmail"
      );
  }

  const data = await createOrder(firestore, orderCollection, email, req.body);
  console.log(data, "data");

  res.status(200).json({ message: "Order Created" });
};

exports.getOrderByDays = async (req, res) => {
  const user = req.user;
  const email = user.email;
  const { customStartDate, customEndDate } = req.body;
  const { days } = req.body;

  if (days) {
    const now = new Date();
    const daysAgo = moment().subtract(days, "days");
    const startDate = daysAgo.toDate();
    const endDate = now;
    await getOrders(email, startDate, endDate, res);
  } else {
    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);
    await getOrders(email, startDate, endDate, res);
  }
};
