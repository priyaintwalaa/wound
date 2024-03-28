const admin = require("firebase-admin");
const { Timestamp,FieldValue } = require("firebase-admin/firestore");
const orderCollection = "orders";
const countCollection = "count"
const patientCollection = 'patients'

function generateOrderId(ivrId,orderCount) {
  return `${ivrId}-${orderCount}`
}

exports.createOrder = async (email, data,patientId) => {
  const firestore = admin.firestore();
  const { name, date, status, amount } = data;
  const formatedDate = new Date(date);
  const collectionRef = firestore.collection(orderCollection);

  const orderRef = await firestore.collection(patientCollection).doc(patientId).get()
  const orderCount = orderRef.data().orderCount

  const orderId = generateOrderId(patientId, orderCount);

  const newOrder = await collectionRef.doc(orderId).set({
    id: orderId,
    name,
    date: formatedDate,
    amount,
    status,
    email,
  }); 
  const orderCountUpdate = await firestore.collection(patientCollection).doc(patientId).update({
    orderCount:FieldValue.increment(1)
  })

};


  exports.getOrders = async (
    userId,
    startDate,
    endDate,
    status,
    res
  ) => {
    const firestore = admin.firestore();

    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    let ordersQuery = firestore
      .collection(orderCollection)
      .where("email", "==", userId)
      .where("date", ">=", startTimestamp)
      .where("date", "<=", endTimestamp)

    const statusPairs = status.split(',');
    console.log(statusPairs,"stattusssss")

    const orders = {
      active: [],
      completed: []
    };
  
    if (statusPairs.includes("shipped") || statusPairs.includes("paid")) {
      const activeStatuses = statusPairs.filter(status => status === "shipped" || status === "paid");
      const activeOrdersQuery = ordersQuery.where("status", "in", activeStatuses);
      const activeOrdersSnapshot = await activeOrdersQuery.get();
      activeOrdersSnapshot.forEach(doc => {
        orders.active.push(doc.data());
      });
    }
  
    if (statusPairs.includes("pending") || statusPairs.includes("awaiting")) {
      const completedStatuses = statusPairs.filter(status => status === "pending" || status === "awaiting");
      const completedOrdersQuery = ordersQuery.where("status", "in", completedStatuses);
      const completedOrdersSnapshot = await completedOrdersQuery.get();
      completedOrdersSnapshot.forEach(doc => {
        orders.completed.push(doc.data());
      });
    }

    res.status(200).json(orders);
  };


exports.createTTF = async (orderId) =>{
  const firestore = admin.firestore();
  const ttfId = orderId + "-TTF"
  //also we can add the object with form details in it
   const addId = await firestore.collection(orderCollection).doc(orderId).update({
    ttfId
   })
}
