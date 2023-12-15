require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;
const cors = require("cors");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const xlsx = require('xlsx');
const ExcelJS = require('exceljs');

// routers
const editHeightRouter = require('./routes/edit-height')
const stopRandom = require('./routes/stop-random')
const randomDebitCredit = require('./routes/random-debit-credit');
const offsetName = require('./routes/offset-name');
const getName = require('./routes/getName');
const otherContent = require('./routes/other-content')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true})); 
app.set("view engine","ejs");
app.set("views","./views");
app.use(express.static('public'));

const fs = require("fs");
const path = require("path");


// Cors
app.use(cors());

// Middleware
app.use(express.json());

// Routes

app.use('/edit-height', editHeightRouter)
app.use('/stop-random', stopRandom)
app.use('/random-debit-credit',randomDebitCredit)
app.use('/offset-name',offsetName)
app.use('/getName',getName)
app.use('/other-content',otherContent)

app.get('/', (req, res)=>{
    res.render("home.ejs");
})

app.get('/', async (req, res) => {
   try {
    const dataFile = req.query.file
    const subName = req.query.sub_name

    if(!dataFile){
        return res.status(400).json({
            message: "Truyền tên file data"
        })
    }
    // Get the path to the XLSX file.
    const xlsxFilePath = `./data/${dataFile}.xlsx`;

    // Read the XLSX file.
    const workbook = xlsx.readFile(xlsxFilePath);

    // Get the names of all sheets in the workbook.
    const sheetNames = workbook.SheetNames;

    // Assume we want the first sheet. You can choose a different sheet if needed.
    const firstSheetName = sheetNames[0];

    // Get the first worksheet in the workbook.
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert the worksheet data into an array of objects.
    const data = xlsx.utils.sheet_to_json(worksheet);


    // Load the docx file as binary content
    
    // Replace the string in the text.
    data.forEach(async (row, index) => {
        const content = fs.readFileSync(
            path.resolve(__dirname, `./template/${row.template}.docx`),
            "binary"
        );

        const zip = new PizZip(content);

        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
        doc.render(row);

        const buf = doc.getZip().generate({
            type: "nodebuffer",
            // compression: DEFLATE adds a compression step.
            // For a 50MB output document, expect 500ms additional CPU time
            compression: "DEFLATE",
        });

        // buf is a nodejs Buffer, you can either write it to a
        // file or res.send it with express for example.
        fs.writeFileSync(path.resolve(__dirname, `./output/${row.template}-${row["tên lđ"]}-${subName && row[subName] ? row[subName] : index}.docx`), buf);
    })

    res.status(200).json({
        data: "Thành công"
    })
   } catch (error) {
    res.status(500).json({
        error: error.message
    })
   }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
// })