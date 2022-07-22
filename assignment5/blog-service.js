const Sequelize = require('sequelize')

var sequelize = new Sequelize('dbthim1eut7vpu', 'mrzubbyxatfjmu', 'd2b00f1a04c49fb1c2b8b3ba043e58e95c25e66650b259f59f6c14c63222062f', {
    host: 'ec2-44-197-128-108.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
   });

var Post = sequelize.define("post", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
})

var Category = sequelize.define("category", {
    category: Sequelize.STRING
})
Post.belongsTo(Category, {foreignKey: 'category', as: 'Category'});
//Post.belongsTo(Category, {foreignKey: 'category'})

exports.initialize = () => {
    return new Promise((resolve,reject) => {
        sequelize.sync()
        .then(resolve('Success! database synced! '))
        .catch(reject('unable to sync the database'));
    })
}

exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll()
        .then(data => {
            resolve(data)
        })
        .catch(err => {
            reject("no results returned")
        })
    })
}

exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published:true
            }
        })
        .then(data => {
            resolve(data)
        })
        .catch('no results returned')
       })
}

exports.getCategories = () => {
    return new Promise ((resolve, reject)=>{
        Category.findAll()
        .then(data => {
            resolve(data)
        })
        .catch(err => {
            reject("no results returned")
        })
    })
}

exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        //postData.published==undefined ? postData.published = false : postData.published = true;
        postData.published = (postData.published) ? true : false;
       /* for (var i in postData) {
            if (postData[i] == "") { postData[i] = null; }
        }*/
        for(const i in postData){
            if(i == ""){
                i=null
            }
        }
        postData.postDate =new Date()

        Post.create(postData)
        .then(resolve(Post.findAll()))
        .catch(reject('unable to create post'))
       });
}

exports.getPostsByCategory = (category) => {
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where: {
                category: category
            }
        })
        .then(data=>{
            resolve(data)
        })
        .catch(err=>{
            reject("no results returned")
        })
        
    })
}

exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve,reject)=>{
        const { gte } = Sequelize.Op
        
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then(data => {
            resolve(data)
        })
        .catch(err => {
            reject("no results returned")
        });
    })
}

exports.getPostById = (id) => {
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where: {
                id: id
            }
        })
        .then(data => {
            resolve(data[0])
        })
        .catch(err => {
            reject("no results returned")
        });
    })
    
}

exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        })
        .then(data => {
            resolve(data);
        })
        .catch(err => {
            reject("no results returned")
        })
    })
}

exports.addCategory = (categoryData) => {
    return new Promise((resolve,reject) => {
        for (var i in categoryData) {
            if (categoryData[i] == "") { categoryData[i] = null; }
        }
        Category.create(categoryData)
        .then(resolve(Category.findAll()))
        .catch(reject('unable to create category'))
    })
};

exports.deleteCategoryById = (id) => {
    return new Promise((resolve,reject) => {
        Category.destroy({
            where: {
                id: id
            }
        })
        .then(resolve())
        .catch(reject('unable to delete'))
    })
}

exports.deletePostById = (id) => {
    return new Promise((resolve,reject) => {
        Post.destroy({
            where: {
                id: id
            }
        })
        .then(resolve())
        .catch(reject('unable to delete'))
    })}
