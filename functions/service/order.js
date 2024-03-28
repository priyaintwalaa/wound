const admin = require("firebase-admin");
const { Timestamp,FieldValue } = require("firebase-admin/firestore");
const orderCollection = "orders";
const countCollection = "count"

function generateOrderId(ivrId,orderCount) {
  return `${ivrId}-${orderCount}`
}

exports.createOrder = async (email, data) => {
  const firestore = admin.firestore();
  const { name, date, status, amount } = data;
  const formatedDate = new Date(date);
  const collectionRef = firestore.collection(orderCollection);

  // const lastOrderRef = await collectionRef.orderBy("id", "desc").limit(1).get();
  // let newId = 1001; // Start with the default first ID
  // if (!lastOrderRef.empty) {
  //   const lastId = lastOrderRef.docs[0].data().id;
  //   newId = lastId + 1;
  // }

  const countRef = firestore.collection(countCollection).doc('counters')
  const dataCount = await countRef.get()
  const countData = await countRef.set({
    orderCount: dataCount.data()?.orderCount || 1
  })
  console.log(dataCount.data(),"countDta")
  const orderCount = await dataCount.data()?.orderCount

  const ivrId = 12345
  const orderId = generateOrderId(ivrId, orderCount);

  const countUpdate = await countRef.update({orderCount:FieldValue.increment(1)})

  const newOrder = await collectionRef.doc(orderId).set({
    id: orderId,
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
