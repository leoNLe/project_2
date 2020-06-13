const db = require("../models");

module.exports = function(app) {
  app.post("/api/addStock", (req, res) => {
    const { symbol, name } = req.body;

    if (!symbol || !name) {
      return res.status(400).send();
    }

    db.Stocks.create({
      symbol: symbol.toLowerCase(),
      name: name.toLowerCase()
    })
      .then(() => {
        res.json({ success: true });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send();
      });
  });

  app.post("/api/sell", async (req, res) => {
    const { userId, symbol, price, quantity } = req.body;

    if (!userId || !symbol || !price || !quantity) {
      return res
        .status(400)
        .json({ message: "missing: userId, symbol, sell price, or quantity" });
    }

    try {
      //Check for current quantity of stock user has
      const allTransactions = await db.Transactions.findAll({
        attributes: ["quantity"],
        where: {
          userId,
          symbol
        }
      });

      let stocksOnHand = 0;
      allTransactions.reduce();
      allTransactions.forEach(element => {
        stocksOnHand += element.dataValues.quantity;
      });
      //Check if user have enough stock to sell
      if (stocksOnHand >= quantity) {
        await db.Transactions.create({
          userId,
          symbol: symbol.toLowerCase(),
          price,
          quantity: `-${quantity}`,
          buy: 0
        });

        res.json({ success: true });
      } else {
        res.json({ sufficient: false, message: "Not enough stocks" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send();
    }
  });

  app.post("/api/buy", async (req, res) => {
    const { userId, symbol, price, quantity } = req.body;

    if (!userId || !symbol || !price || !quantity) {
      return res.status(400).send();
    }
    try {
      //Check if stock is in DB.
      const hasStock = await db.Stocks.findOne({ where: { symbol } });
      if (!hasStock) {
        //call Api to get username
      }

      await db.Transactions.create({
        symbol: symbol.toLowerCase(),
        price,
        quantity,
        userId,
        buy: 1
      });

      res.json({ success: true });
    } catch (err) {
      console.log(err);
      res.status(500).send();
    }
  });

  app.get("/api/getProfile", async (req, res) => {
    const userId = req.body;

    try {
      const data = await db.Transactions.findAll({
        attributes: [
          "symbol",
          [db.Sequelize.fn("sum", db.Sequelize.col("quantity")), "quantity"]
        ],
        where: userId,
        group: ["symbol"],
        include: {
          model: db.Stocks
        }
      });

      const stocksData = [];
      data.forEach(
        ({
          dataValues,
          Stock: {
            dataValues: { name }
          }
        }) => {
          stocksData.push({
            name: name,
            symbol: dataValues.symbol.toUpperCase(),
            quantity: dataValues.quantity
          });
        }
      );

      res.json({ stocksData });
    } catch (err) {
      console.log(err);
    }
  });
};