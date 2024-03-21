const admin = require('firebase-admin');

exports.createOrder = async (firestore,collectionName,email,data) =>{
    const { name, date, amount } = data;
    const formatedDate = new Date(date)
   const newOrder = await firestore.collection(collectionName).add({
    name, 
    date: formatedDate,
    amount,
    email
   })
}

function convertDateFormat(dateString) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}

exports.getOrders = async (userId, days,res)=>{
    const firestore = admin.firestore()
    // console.log(startDate)
    // const start = new Date(`${startDate}`);
    // const start = new Date(`${startDate.split('-').reverse().join('-')}`);
    // console.log(start,"start")
    // console.log(startDate.split("-").reverse())
    // console.log(startDate,"start")
    // console.log(endDate,"end")

    const now = new Date()
    const startDateObj = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toString();
    const endDateObj = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 1).toString()

    console.log(typeof(startDateObj))
    console.log(convertDateFormat(startDateObj), convertDateFormat(endDateObj))
    console.log(startDateObj).toString()

    const ordersSnapshot = await firestore.collection('orders')
    .where('email', '==', userId)
    // .orderBy('date')
    // .startAt(startDateObj)
    // .endAt(endDateObj)
    .where('date', '<=',  startDateObj.toString())
    // .where('date', '>=',  convertDateFormat(endDateObj))  
    .get()
    ;


  const orders = [];
  ordersSnapshot.forEach((doc) => {
    console.log(doc.data())
    orders.push(doc.data());
  });

  console.log(orders)
  console.log('Orders for user within the specified date range:', orders);
//   return orders;
    res.status(200).json(orders)
}

// exports.filterOrder = (now,days) =>{
//     return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
// }