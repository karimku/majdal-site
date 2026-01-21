exports.handler = async (event) => {
  console.log("Waitlist function triggered");

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
