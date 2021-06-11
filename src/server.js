import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();

app.use(express.json());

const withDB = async (operations) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db('my-blog');
    
        await operations(db);
    
        client.close();
    } catch (err) {
        res.status(500).send({ message: 'Database Error!', err });
    }
}

app.get('api/articles/', async (req, res) => {

    await withDB(async (db) => {
        const articleInfo = await db.collection('articles').find();

        res.status(200).json(articleInfo);
    });
})

app.get('/api/articles/:name', async (req, res) => {

    const articleName = req.params.name;

    await withDB(async db => {
        const articleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(articleInfo);
    });
});

// app.get('/api/articles/:id', async (req, res) => {
//     withDB(async (db) => {
//         const articleId = req.params.id;

//         const articleInfo = await db.collection('articles').findOne({ _id: articleId });
//         res.status(200).json(articleInfo);
//     }, res);
// })

app.post('/api/articles/:name/upvote', async (req, res) => {

    const articleName = req.params.name;

    await withDB(async db => {
        const articleInfo = await db.collection('articles').findOne({ name: articleName });

        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                upvotes: articleInfo.upvotes + 1,
            }
        });

        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(updatedArticleInfo);
    });
});

app.post('/api/articles/:name/add-comment', async (req, res) => {

    const articleName = req.params.name;
    const newComment  = req.body.comment;

    await withDB(async (db) => {
        const articleInfo = await db.collection('articles').findOne({ name: articleName });

        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                comments: articleInfo.comments.concat(newComment),
            }
        });

        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(updatedArticleInfo);
    });
});

// app.delete('/api/articles/:name/upvote', async (req, res) => {
//     withDB(async (db) => {
//         const articleName = req.params.name;
    
//         const articleInfo = await db.collection('articles').findOne({ name: articleName });
//         await db.collection('articles').updateOne({ name: articleName }, {
//             '$set': {
//                 upvotes: 0,
//             },
//         });
//         const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
    
//         res.status(200).json(updatedArticleInfo);
//     }, res);
// });

app.listen(9000, () => console.log('Listening on port 9000'));