const admin = require("firebase-admin");
const patientCollection = 'patients'
const countCollection = "count"

const { FieldValue } = require("firebase-admin/firestore");

const generateIVRNumber = () => {
  return Math.floor(10000 + Math.random() * 90000); // Generate a random 5-digit number
};

exports.addPatient = async (data)=>{
  const firestore = admin.firestore();
   const {name} = data

   const countRef = firestore.collection(countCollection).doc('counters')
   const dataCount = await countRef.get()
   const countData = await countRef.set({
     IVRCount: dataCount.data()?.IVRCount || generateIVRNumber()
   })
 
   const IVR =  dataCount.data().IVRCount.toString()

   const addDetails = firestore.collection(patientCollection).doc(IVR).set({
    name
   })

   const countUpdate = await countRef.update({IVRCount:FieldValue.increment(1)})
}