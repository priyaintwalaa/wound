const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");
const orderCollection = "orders";

exports.createOrder = async (email, data) => {
  const firestore = admin.firestore();
  const { name, date, amount } = data;
  const formatedDate = new Date(date);
  const newOrder = await firestore.collection(orderCollection).add({
    name,
    date: formatedDate,
    amount,
    email,
  });
};

exports.getOrders = async (userId, startDate, endDate, res) => {
  const firestore = admin.firestore();

  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const ordersSnapshot = await firestore
    .collection(orderCollection)
    .where("email", "==", userId)
    .where("date", ">=", startTimestamp)
    .where("date", "<=", endTimestamp)
    .get();
  const orders = [];
  ordersSnapshot.forEach((doc) => {
    orders.push(doc.data());
  });
  res.status(200).json(orders);
};
