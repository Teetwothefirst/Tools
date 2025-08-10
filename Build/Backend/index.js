const express = require('express')
const app = express()
const cors = require('cors')
const port = 3000

//Middelware
app.use(cors())
app.use(express.json())

//Local Database
const Post = [
  {id: 1, titlePost: 'Emerging Tech', descriptionPost: 'The way things are going I should have my Blog Page up and Running by Tonight'}
]

app.post('/api/createPost', (req, res) => {
    const {title, description} = req.body;
    console.log("Received Data:", title, description);
    
    const dataUpdate = {
      id: Post.length + 1,
      titlePost: title,
      descriptionPost: description
    }
    Post.push(dataUpdate)
    console.log("Post Data:", Post);
    res.status(200).json({message: 'Post Created Successfully', data: dataUpdate})
})

app.get('/api/posts', (req, res) => {
    // const {title, body} = req.body
    // res.send("ddd")
  //   res.json([
  //   { id: 1, title: 'First Post', body: 'This is the first post.' },
  //   { id: 2, title: 'Second Post', body: 'This is the second post.' }
  // ])
    res.json(Post)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
