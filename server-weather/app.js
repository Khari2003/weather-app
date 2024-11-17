const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const CityRouter = require('./router/city.router');
const IndexRouter = require('./router/index.router');

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:false}))

// app.use(cookieParser());

app.use('/', IndexRouter);
app.use('/api', CityRouter)
app.listen(port, () => console.log(`API running on port ${port}`));
