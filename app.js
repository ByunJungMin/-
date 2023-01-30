const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const sign_router = require('./routes/sign_router');
const post_router = require('./routes/post_router');
const comment_router = require('./routes/comment_router');
app.use(cookieParser());

app.use('/api',express.json(), express.urlencoded({extended: false}), [sign_router, post_router, comment_router]);


app.listen(5000, () => {
    console.log('5000포트 서버가 켜졌어요!');
});