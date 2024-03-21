const orderCollection = "orders";
const admin = require("firebase-admin");
const { createOrder, getOrders, filterOrder } = require("../service/order");

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
  const { days } = req.body

  // Example usage for different time frames
  const now = new Date();

  // 7 days
  if(days === 7){
    // const sevenDaysAgo = filterOrder(now,days)
    await getOrders(email,days, res);
  }else if(days === 14){
    // const fourteenDaysAgo = filterOrder(now,days)
   await getOrders(email, days, res);
  }else if( days === 30){
    // const thirtyDaysAgo = filterOrder(now,days)
    await getOrders(email, days, res);
  }else if(days === 90){
    // const ninetyDaysAgo = filterOrder(now,days)
   await getOrders(email, days, res);
  }else{
    await getOrders(email,365,res)
    // await  getOrders(email, customStartDate, customEndDate, res);
  }
};
