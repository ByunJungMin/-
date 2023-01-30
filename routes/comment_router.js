const express = require('express');
const router = express.Router();
const {Comment} = require('../models');
const {Post} = require('../models');
const auth_middleware = require('../middlewares/auth-middleware.js');

// 댓글 조회
router.get('/comments/:post_Id', async (req,res) => {
    try {
        const {post_Id} = req.params;
        const comments = await Comment.findAll({
            order: [['createdAt', 'DESC']],
            where: {
                post_Id: post_Id 
            }
        });

        return res.send({comments});
    } catch (err) {
        return res.status(400).send({errorMessage: '게시글 조회에 실패하였습니다.'});
    };

});

// 댓글 작성 api
router.post('/comments/:post_Id', auth_middleware, async (req,res) => {
    try {
        let {post_Id} = req.params;
        const user_Id = res.locals.user.dataValues.id;
        const {comment} = req.body;
        // post_Id = Number(post_Id);
        
        // 게시글 불러오기
        const post = await Post.findOne({
            where: {
                id: post_Id
            }
        });

        // 게시글이 존재하지 않으면 에러메세지
        if (post === null) {
            return res.status(200).send({errorMessage: '게시글이 존재하지 않습니다.'});
        };

        await Comment.create({ comment,  user_Id, post_Id});
        return res.status(200).send({});

    } catch (err) {
        return res.status(400).send({errorMessage: '댓글 작성에 실패하였습니다.'});
    };
});

// 댓글 수정
router.put('/comments/:comment_Id', auth_middleware, async (req, res) => {
    try {
        const {comment_Id} = req.params;
        const {comment} = req.body;

        const user_Id = res.locals.user.dataValues.id;

        let comments_user_Id = await Comment.findOne({
            where: {
                id: comment_Id
            }
        });
        comments_user_Id = comments_user_Id.user_Id;

        if(user_Id !== comments_user_Id) {
            return res.status(400).send({errorMessage: '댓글 작성자가 아닙니다.'});
        };

        const update_comment = await Comment.update(
            {comment: comment},
            {where: {id: comment_Id}}
        );
        return res.status(200).send({update_comment});
    } catch (err) {
        return res.status(400).send({errorMessage: '댓글 수정에 실패하였습니다.'});
    }
});

// 댓글 삭제
router.delete('/comments/:comment_Id', auth_middleware, async (req,res) => {
    try {
        const {comment_Id} = req.params;
        const user_Id = res.locals.user.dataValues.id;

        let comment_user_Id = await Comment.findOne({
            where: {
                id: comment_Id
            }
        });
        comment_user_Id = comment_user_Id.user_Id

        if (user_Id !== comment_user_Id) {
            return res.status(400).send({message: '작성자만 삭제 할 수 있습니다.'});
        }

        await Comment.destroy({
            where: {id: comment_Id}
        });

        return res.status(200).send({message: '댓글 삭제 성공 !'})
    } catch (err) {
        return res.status(400).send({errorMessage: '댓글 삭제에 실패하였습니다.'});
    };
})
module.exports = router;