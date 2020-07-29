const express = require('express')
const merge = require('easy-pdf-merge');
const fsExtra = require('fs-extra')
var PdfPrinter = require('pdfmake');
var multer = require('multer');
var path = require('path');
var fs = require('fs');


var fonts = {
  Roboto: {
    normal: './fonts/Roboto-Regular.ttf',
    bold: './fonts/Roboto-Medium.ttf',
    italics: './fonts/Roboto-Italic.ttf',
    bolditalics: './fonts/Roboto-MediumItalic.ttf'
  }
};

var printer = new PdfPrinter(fonts);

const app = express()
const port = 5555

app.use(express.static('public'));

app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


app.get('/', function(req, res){
  res.sendFile('index.html');
}); 

app.post('/combinePdf', async function(req, res) {
	const directory = './tmp/pdf/merge';

  var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, directory);
    },
    filename: function(req, file, callback) {
      callback(null, file.originalname);
    },
  });

  var upload = multer({ storage: storage }).array('userPhoto', 20);

  
  await fsExtra.emptyDir(directory)
  upload(req, res, async function(err) {
    try {
        if (err) {
          console.log('Error uploading file.', err);
          res.status(400).send('Error uploading file.', err);
        }
        let files = req.files.map((file) => {
          return `${directory}/${file.originalname}`;
        });
        console.log('files', files);
      
        merge(files,`${directory}/merged.pdf`,function(err){
          if(err) {
            return console.log(err)
          }
          var data =fs.readFileSync(`${directory}/merged.pdf`);
          res.contentType("application/pdf");
          res.status(200).send(data);
        });
    } catch (err) {
      console.log('Error in converting PDF files', err);
      res.status(400).send('Error  in converting', err);
    }
  });
});



function createPdfBinary(pdfDoc, callback) {
  const directory = './tmp/images/merge';
  var doc = printer.createPdfKitDocument(pdfDoc);

  var chunks = [];
  var result;

  doc.pipe(
    fs.createWriteStream(`${directory}/output.pdf`).on("error", (err) => {
      errorCallback(err.message);
    })
  );

  doc.on('end', () => {
    callback("Done");
    console.log("PDF successfully created and stored");
  });
  
  doc.end();

  // doc.on('data', function (chunk) {
  //   chunks.push(chunk);
  // });
  // doc.on('end', function () {
  //   result = Buffer.concat(chunks);
  //   callback('data:application/pdf;base64,' + result.toString('base64'));
  // });
  // doc.end();
}

app.post('/mergeImageIntoPdf', async function(req, res) {
  const directory = './tmp/images/merge';


  var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, directory);
    },
    filename: function(req, file, callback) {
      callback(null, file.originalname);
    },
  });

  var upload = multer({ storage: storage }).array('userPhoto', 20);

  await fsExtra.emptyDir(directory)
  upload(req, res, async function(err) {
    try {
        if (err) {
          console.log('Error uploading file.', err);
          res.status(400).send('Error uploading file.', err);
        }

        let fileContent = [];
        req.files.forEach((file) => {
          fileContent.push({
            image : `${directory}/${file.originalname}`,
            width: 300
          })
        });

        var docDefinition = {content: fileContent};

        createPdfBinary(docDefinition, function () {
          var data =fs.readFileSync(`${directory}/output.pdf`);
          res.contentType("application/pdf");
          res.status(200).send(data);
        }, function (error) {
          res.status(400).send("Error");
        });
    } catch (err) {
      console.log('Error in converting PDF files', err);
      res.status(400).send('Error  in converting', err);
    }
  });
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))