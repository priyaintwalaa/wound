const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");
const orderCollection = "orders";
const getUniqueId = require("firebase-auto-ids");

exports.createOrder = async (email, data) => {
  const firestore = admin.firestore();
  const { name, date, status, amount } = data;
  const formatedDate = new Date(date);
  const collectionRef = firestore.collection(orderCollection);

  const lastOrderRef = await collectionRef.orderBy("id", "desc").limit(1).get();
  let newId = 1001; // Start with the default first ID
  if (!lastOrderRef.empty) {
    const lastId = lastOrderRef.docs[0].data().id;
    newId = lastId + 1;
  }

  const newOrder = await collectionRef.doc(newId.toString()).set({
    id: newId,
    name,
    date: formatedDate,
    amount,
    status,
    email,
  });
};

exports.getOrders = async (
  userId,
  startDate,
  endDate,
  activeStatus,
  completedStatus,
  res
) => {
  const firestore = admin.firestore();

  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  const ordersSnapshot = await firestore
    .collection(orderCollection)
    .where("email", "==", userId)
    .where("date", ">=", startTimestamp)
    .where("date", "<=", endTimestamp)
    .get();

  const orders = {
    activeOrders: [],
    completedOrders: [],
  };

  ordersSnapshot.forEach((doc) => {
    const order = doc.data();
    // Active Orders
    if (activeStatus === "all") {
      if (order.status === "pending" || order.status === "shipped") {
        orders.activeOrders.push(order);
      }
    } else if (order.status === activeStatus) {
      orders.activeOrders.push(order);
    }
    //Completed Orders
    if (completedStatus === "all") {
      if (order.status === "awaiting" || order.status === "paid") {
        orders.completedOrders.push(order);
      }
    } else if (order.status === completedStatus) {
      orders.completedOrders.push(order);
    }
  });
  res.status(200).json(orders);
};
