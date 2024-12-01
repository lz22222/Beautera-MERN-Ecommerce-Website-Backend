require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRouter = require('./src/users/user.route')
const productRouter = require('./src/products/products.route')
const reviewRouter = require('./src/reviews/reviews.router')
const ordersRouter = require('./src/orders/orders.route')
const statsRouter = require('./src/stats/stats.route')
const uploadImage = require("./src/utils/uploadImage")

app.use(express.json({ limit: '25mb' }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'https://beautera-mern-ecommerce-website-frontend.vercel.app/',   //http://localhost:5173
    credentials: true,
  })
);
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/stats', statsRouter)

app.post('/uploadImage', (req, res) => {
	uploadImage(req.body.image)
		.then((url) => res.send(url))
		.catch((err) => res.status(500).send(err))
})


async function main() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('MongoDB is successfully connected.');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

app.get('/', (req, res) => {
  res.send('Beautera is running');
});

main().then(() => {
  app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
  });
});