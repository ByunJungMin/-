const express = require('express');
const router = express.Router();
const {Post} = require('../models');
const {User} = require('../models');
const auth_middleware = require('../middlewares/auth-middleware.js');

// 게시글 전체 조회 api
router.get('/posts', async (req,res) => {
    try {
        // 게시글 내림차순으로 가져오기
        const posts = await Post.findAll({
            order: [['createdAt','DESC']]
        });

        return res.status(200).send({posts});

    }   catch (err) {
        return res.status(400).send({errorMessage: '게시글 조회에 실패하였습니다.'})
    };
});

// 게시글 상세 조회 api
router.get('/posts/:post_Id', async (req,res) => {
    try {
        const {post_Id} = req.params;
        // 해당 게시글 가져오기
        const post = await Post.findOne({
            where: {
                id: post_Id
            }
        });

        // 해당 게시글의 user_Id 의 닉네임 가져오기
        const user_Id = post.user_Id;
        let user = await User.findOne({
            where: {
                id: user_Id
            }
        });
        user = user.nickname;

        return res.status(200).send({post,user});

    } catch (err) {
        return res.status(400).send({errorMessage: '게시글 조회에 실패하였습니다.'});
    };
});

// 게시글 작성 api
router.post('/posts', auth_middleware, async (req,res) => {
    try {
        const user_Id = res.locals.user.dataValues.id;
        const {title, content} = req.body;
        
        // 제목이 없거나 내용이 없을 때
        if (title === undefined) {
            return res.status(400).send({errorMessage: '제목을 입력해 주세요.'});
        } else if (content === undefined) {
            return res.status(400).send({errorMessage: '내용을 입력해 주세요.'});
        };
        
        // 게시글 작성
        await Post.create({user_Id, title, content});

        return res.status(200).send({});
    } catch (err) {
        return res.status(400).send({errorMessage: '게시글 작성에 실패하였습니다.'});
    }
});

// 게시글 수정 api
router.put('/posts/:post_Id', auth_middleware, async (req,res) => {
    try {
        const {post_Id} = req.params;
        const {update_title, update_content} = req.body;
        
        // 로그인한 유저의 ID
        const user_Id = res.locals.user.dataValues.id;

        // 게시글을 작성한 유저의 ID
        let post = await Post.findOne({
            where: {
                id: post_Id,
            }
        });
        post = post.user_Id;

        // 로그인한 유저와 게시글을 작성한 유저가 다를 때
        if (user_Id !== post){
            return res.status(400).send({errorMessage: '게시글 작성자가 아닙니다.'});
        };

        // 게시글 수정
        const update_post = await Post.update(
            {title: update_title, content: update_content},
            {where: {id: post_Id}},
        );
        return res.status(200).send({update_post});

    } catch (err) {
        return res.status(400).send({errorMessage: '게시글이 존재하지 않습니다.'});
    }
})

// 게시글 삭제 api
router.delete('/posts/:post_Id', auth_middleware, async (req,res) => {
    try {
        const {post_Id} = req.params;
        // 로그인한 유저의 ID
        const user_Id = res.locals.user.dataValues.id;

        // 게시글을 작성한 유저의 ID
        let post = await Post.findOne({
            where: {
                id: post_Id
            }
        });
        post = post.user_Id;

        // 로그인한 유저와 게시글을 작성한 유저가 다를 때
        if (user_Id !== post){
            return res.status(400).send({errorMessage: '작성자만 삭제 할 수 있습니다.'});
        };

        // 게시글 삭제
        await Post.destroy({
            where: {id: post_Id}
        });

        return res.status(200).send({message: '게시글 삭제 성공 !'});
    } catch (err) {
        return res.status(400).send({errorMessage: '게시글 삭제에 실패하였습니다.'});
    }
});


module.exports = router;