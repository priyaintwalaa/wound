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
    const statuses = {};
    statusPairs.forEach(pair => {
      const [key, value] = pair.split('-');
      if (key && value) {
        statuses[key] = value;
      }
    });

    let SecOrderQuery = ordersQuery

    const orders = {
      activeOrders: [],
      completedOrders: [],
    };

    if(statuses['active'] === "all"){
      ordersQuery = await ordersQuery.where("status","in",["pending","shipped"]).get()
    }else{
      ordersQuery = await ordersQuery.where("status","==",statuses['active']).get()
    }
    
    if(statuses['completed'] === "all"){
      SecOrderQuery =await SecOrderQuery.where("status","in",["paid","awaiting"]).get()
    }else{
      SecOrderQuery =await SecOrderQuery.where("status","==",statuses['completed']).get()
    }

    ordersQuery.forEach((doc)=>{
      const order = doc.data()
      orders.activeOrders.push(order)
    })

    SecOrderQuery.forEach((doc)=>{
      const order = doc.data()
      orders.completedOrders.push(order)
    })
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