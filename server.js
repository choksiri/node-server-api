let express = require('express');
let app = express();
const multer = require('multer');
//let bodyParser = require('body-parser');
let mysql = require('mysql');
const path = require('path');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


app.get('/',(req, res) =>{
    res.send('This is my API running...krabb')
});


app.get('/', function (req, res) {
    return res.send({ error: true, message: 'user Web API' })
});


let dbConn = mysql.createConnection({
    host: 'bavjcvk16xaokour9zkq-mysql.services.clever-cloud.com',
    user: 'udvdmo2skwq3ucjk',
    password: 'uRZ1sBu4FJY0T1IigD7',
    database: 'bavjcvk16xaokour9zkq',
});

dbConn.connect((err) => {
    if (err){
        console.log('error connect mySQL databasek = ',err)
        return;
    }
    console.log('my SQL connecting successfully');
});

// ตั้งค่า Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueFileName = 'pagunplook'+Date.now() +'.jpg';
      cb(null, uniqueFileName);
    }
});
const upload = multer({ storage: storage });

// Assume you have an Express app
app.get('/getimage/:user_id', (req, res) => {
    const user_id = req.params.user_id;

    // Query the database to get the file_path based on user_id
    dbConn.query('SELECT file_path FROM user WHERE user_id = ?', [user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ code: 500, msg: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).send({ code: 404, msg: 'User not found' });
        }

        const file_path = results[0].file_path;

        if (file_path && file_path.trim() !== '') {
            if (fs.existsSync(file_path)) {
                const imageBuffer = fs.readFileSync(file_path);
                const base64Image = imageBuffer.toString('base64');
                return res.send(base64Image);
            } else {
                return res.status(404).send({ code: 404, msg: 'File not found' });
            }
        } else {
            // ถ้า file_path เป็นค่าว่างหรือมีช่องว่างเพิ่มเติม
            return res.send('');
        }
        // const fileData = fs.readFileSync(file_path);
        // อ่านไฟล์ภาพและส่งกลับในรูปแบบ base64
        // const imageBuffer = fs.readFileSync(file_path);
        // const base64Image = imageBuffer.toString('base64');
        // res.send(base64Image)
        // fs.access(file_path, fs.constants.F_OK, (err) => {
        //     if (err) {
        //         console.error('File does not exist:', file_path);
        //         return res.status(404).send('File not found');
        //     }
        //     // ส่งไฟล์
        //     res.sendFile(file_path);
        // });

    });
});

app.get('/getimagepb/:pb_id', (req, res) => {
    const pb_id = req.params.pb_id;

    // Query the database to get the file_path based on pb_id
    dbConn.query('SELECT file_path FROM problem WHERE pb_id = ?', [pb_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ code: 500, msg: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).send({ code: 404, msg: 'pb not found' });
        }

        const file_path = results[0].file_path;
        const fileData = fs.readFileSync(file_path);
        // อ่านไฟล์ภาพและส่งกลับในรูปแบบ base64
        const imageBuffer = fs.readFileSync(file_path);
        const base64Image = imageBuffer.toString('base64');
        res.send(base64Image)
        // fs.access(file_path, fs.constants.F_OK, (err) => {
        //     if (err) {
        //         console.error('File does not exist:', file_path);
        //         return res.status(404).send('File not found');
        //     }
        //     // ส่งไฟล์
        //     res.sendFile(file_path);
        // });

    });
});

app.get('/allproblem/:user_id', function (req, res) {
    let user_id = req.params.user_id;
    
    if (!user_id) {
        return res.status(400).send({ error: true, message: 'Please provide user id' });
    }

    dbConn.query("SELECT * from problem INNER JOIN problem_list ON problem.problem_id = problem_list.problem_id WHERE problem.user_id = ?", user_id, function (error, results, fields) {
        if (error) throw error;

        // // วนลูปผลลัพธ์เพื่ออ่านไฟล์และแปลงเป็น Base64
        // results.forEach((result) => {
        //     const filePath = result.file_path;

        //     if (filePath) {
        //         const fileData = fs.readFileSync(filePath);
        //         const base64Data = fileData.toString('base64');
                
        //         // เพิ่มข้อมูล Base64 เข้าไปในผลลัพธ์
        //         result.base64_image = base64Data;
        //     }
        // });

        return res.send(results);
    });
});

//query problem
app.get('/allproblem1/:user_id', function (req, res) {
    let user_id= req.params.user_id;
    if (!user_id) {
        return res.status(400).send({ error: true, message: 'Please provide user id' });
    }
    dbConn.query("SELECT * from problem INNER JOIN problem_list ON problem.problem_id = problem_list.problem_id WHERE problem.user_id = ?", user_id, function (error, results, fields) {
        if(error) throw error;
        return res.send(results);
        
    });
});

// Upload Single File
app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    const user_id = req.body.user_id; // แก้ไขนี้

    if (!file) {
        const error = new Error('Please upload a file');
        error.httpStatusCode = 400;
        console.log("error", 'Please upload a file');
        return res.status(400).send({ code: 400, msg: 'Please upload a file' });
    } else {
        // const imagePath = path.resolve(file.path);
        const imagePath = file.path;

        dbConn.query('UPDATE user SET file_path = ? WHERE user_id = ?', [imagePath, user_id], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ code: 500, msg: 'Internal Server Error' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).send({ code: 404, msg: 'User not found' });
            }

            return res.status(200).send({ code: 200, msg: 'File uploaded successfully' });
        });
    }
});

app.post('/uploadproblem', upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    const problem_id = req.body.problem_id; // ตัวอย่างข้อมูลเพิ่มเติมที่คุณต้องการเพิ่ม
    const user_id = req.body.user_id; // ตัวอย่างข้อมูลเพิ่มเติมที่คุณต้องการเพิ่ม

    if (!file) {
        const error = new Error('Please upload a file');
        error.httpStatusCode = 400;
        console.log("error", 'Please upload a file');
        return res.status(400).send({ code: 400, msg: 'Please upload a file' });
    } else {
        // const imagePath = path.resolve(file.path);
        const imagePath = file.path;

        const sql = 'INSERT INTO problem (file_path , problem_id , user_id) VALUES (?, ?, ?)';
        const values = [imagePath , problem_id , user_id];

        dbConn.query(sql, values, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ code: 500, msg: 'Internal Server Error' });
            }

            return res.status(200).send({ code: 200, msg: 'File uploaded successfully' });
        });
    }
});



//addProblem
app.post('/addproblem',function (req,res){
    var problem = req.body
    if(!problem){
        return res.status(400).send({error:true, message: 'Plase provide user'});
    }

    dbConn.query("INSERT INTO problem SET ?" , problem, function(error,results,fields){
        if(error) throw error;
        return res.send(results);

    });
});

  

app.get('/alluser', function (req, res) {
    dbConn.query('SELECT * FROM user', function (error, results, fields) {
        if (error) throw error;
        return res.send(results);
    });
});

///login
app.post('/login/', function(req, res) {
    let data = req.body;

    let name = data.user_name;
    let password = data.user_password;

    dbConn.query('SELECT * FROM user WHERE user_name = ? AND user_password = ?', [name,password], function(error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            return res.json({user_id:results[0].user_id,user_name:results[0].user_name,user_email:results[0].user_email,user_password:results[0].user_password});
        } else {
            return res.status(400).send({ error: true, message: 'user id Not Found!!' });
        }
    });
});

// app.post('/login/', function(req, res) {
//     let data = req.body;

//     let name = data.user_name;
//     let password = data.user_password;

//     dbConn.query('SELECT * FROM user WHERE user_name = ?', [name], function(error, results, fields) {
//         if (error) throw error;
//         if (results.length > 0) {
//             bcrypt.compare(password, results[0].user_password, function(err, result) {
//                 if (result) {
//                     return res.json({user_id: results[0].user_id, user_name: results[0].user_name, user_email: results[0].user_email, user_password: results[0].user_password});
//                 } else {
//                     return res.status(400).send({ error: true, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
//                 }
//             });
//         } else {
//             return res.status(400).send({ error: true, message: 'ไม่พบผู้ใช้ในระบบ' });
//         }
//     });
// });
//insert user /register

app.post('/user',function (req,res){
    var user = req.body
    if(!user){
        return res.status(400).send({error:true, message: 'Plase provide user'});
    }

    dbConn.query("INSERT INTO user SET ?" , user, function(error,results,fields){
        if(error) throw error;
        return res.send(results);

    });
});



//insert add myplants /register

app.post('/addmyplants',function (req,res){
    var myplants = req.body
    if(!myplants){
        return res.status(400).send({error:true, message: 'Plase provide myplants'});
    }

    dbConn.query("INSERT INTO my_plants SET ?" , myplants, function(error,results,fields){
        if(error) throw error;
        return res.send(results);

    });
});

//query myplants
app.get('/allmyplant/:id', function (req, res) {
    let user_id= req.params.id;
    if (!user_id) {
        return res.status(400).send({ error: true, message: 'Please provide user id' });
    }
    dbConn.query("SELECT * from my_plants INNER JOIN status ON my_plants.status_id = status.status_id WHERE my_plants.user_id = ?", user_id, function (error, results, fields) {
        if(error) throw error;
        return res.send(results);
        
    });
});

//query imageprofile
app.get('/loadimageprofile/:id', function (req, res) {
    let user_id= req.params.id;
    if (!user_id) {
        return res.status(400).send({ error: true, message: 'Please provide user id' });
    }
    dbConn.query("SELECT file_path from user WHERE user_id = ?", user_id, function (error, results, fields) {
        if(error) throw error;
        return res.send(results[0])
        
    });
});




//query profile
app.get('/profile/:id', function (req, res) {
    let user_id= req.params.id;
    if (!user_id) {
        return res.status(400).send({ error: true, message: 'Please provide user id' });
    }
    dbConn.query("SELECT * from user WHERE user_id = ?", user_id, function (error, results, fields) {
        if(error) throw error;
        return res.send(results);
        
    });
});

//update status
app.put('/status/:id',function(req,res){
    let plants_id = req.params.id;
    let my_plants = req.body
    if(!plants_id || !my_plants){
        return res.status(400).send({ error: true, message: 'Please provide user id and user data' }); 
    }

    dbConn.query('UPDATE my_plants SET ? WHERE plants_id = ?', [my_plants, plants_id], function(error, results, fields) {
        if (error) throw error;
        
        return res.send({ error: false, message: 'my_plants has been updated seccessfully' });
       
    });    
})



//update profile
app.put('/profile/:id',function(req,res){
    let user_id = req.params.id;
    let user = req.body
    if(!user_id || !user){
        return res.status(400).send({ error: true, message: 'Please provide user id ' }); 
    }

    dbConn.query('UPDATE user SET ? WHERE user_id = ?', [user, user_id], function(error, results, fields) {
        if (error) throw error;
        
        return res.send({ error: false, message: 'user has been updated seccessfully' });
       
    });    
})

//delete problem
app.delete('/delproblem/:pb_id', function(req,res){
    let pb_id = req.params.pb_id;
    if (!pb_id) {
        return res.status(400).send({ error: true, message: 'Please provide pb_id' });
    }
    dbConn.query('DELETE FROM problem WHERE pb_id = ?', pb_id, function(error, results, fields) {
        if (error) throw error;
        
        return res.send({ error: false, message: 'user has been problem  seccessfully' });
       
    });    
})




// //set port
app.listen(21373, function () {
    console.log('Node app is running on port 21373');

});

module.exports = app;


