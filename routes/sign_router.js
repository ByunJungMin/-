const express = require('express');
const router = express.Router();
const {Op} = require('sequelize');
const {User} = require("../models");
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'qwoeiewfwrpfjefsdjaklgahflw';

// 회원가입 api
router.post('/sign-up', async (req,res) => {
    const {nickname, password, confirm_password} = req.body;

    // 닉네임 조건 = 3글자 이상, 알파벳 대문자, 알파벳 소문자, 숫자 포함인지 확인 => 결과는 true or false 로 반환
    const reg = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{3,}$/
    const existsUsers = await User.findAll({
        where: {
            nickname
        }
    });

    console.log(existsUsers)
    // 닉네임 조건 확인
    if (reg.test(nickname) === false) {
        return res.status(400).send({errorMessage: '닉네임 형식이 올바르지 않습니다.'});
    } else if (existsUsers.length) {
        return res.status(400).send({errorMessage: '이미 사용중인 닉네임 입니다.'});
    };

    // 비밀번호 조건 확인
    if (password.length < 4) {
        return res.status(400).send({errorMessage: '비밀번호 형식이 올바르지 않습니다.'});
    } else if (password === nickname) {
        return res.status(400).send({errorMessage: '비밀번호에 닉네임이 포함되어 있습니다.'});
    } else if (password !== confirm_password) {
        return res.status(400).send({errorMessage: '패스워드와 패스워드 확인란을 동일하게 입력해 주세요.'});
    };

    await User.create({nickname, password});
    res.status(201).send({});
})

// 로그인 api
router.post('/sign-in', async (req,res) => {
    const {nickname, password} = req.body;
    const user = await User.findOne({
        where: {
            nickname
        }
    });

    // user 정보가 없거나 db에 저장되어있는 password가 일치 하지 않을 때
    if (!user || password !== user.password) {
        return res.status(400).send({errorMessage: '닉네임 또는 패스워드가 틀렸습니다.'});
    };
    
    // token 이라는 이름의 jwt token 발급
    res.send({
        token: jwt.sign({userId: user.id}, SECRET_KEY)
    });
});

module.exports = router;