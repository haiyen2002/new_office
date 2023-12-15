const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const multer = require('multer');
const path = require('path');
const ExcelJS = require("exceljs");

// Xử lý yêu cầu GET đến /random-sk-duyet
router.get('/', (req, res) => {
    // Thực hiện các xử lý khi nhận yêu cầu GET tới /random-sk-duyet
    res.render('edit-height', { title: 'edit height' });
});

// Cấu hình Multer để lưu trữ tệp tin được tải lên vào thư mục 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/edit-height');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload',upload.single('uploadedFile'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('Không có tệp tin nào được tải lên.');
  }
  // Xử lý tệp tin nếu cần
  const uploadedFileName = `./uploads/edit-height/${req.file.filename}`;
  let start = req.body.start;
  let end = req.body.end;
  let randomCol = req.body.randomCol;

  const xlsxFilePath = uploadedFileName; // Tên file input
  let workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxFilePath);
  // sheet gốc
  let sheet = workbook.getWorksheet("Sheet1");

//   dừng random
  for (let i = start; i <= end; i++) {
    let cellC = sheet.getCell(`${randomCol}${i}`).text;
  sheet.getCell(`${randomCol}${i}`).value = cellC;
}

  // Tăng chiều cao cho các ô từ B13  đến B230
//   for (let row = start; row <= end; row++) {
//     let rowHeight = sheet.getRow(row).height 
//     sheet.getRow(row).height = rowHeight <= 25 ? 29 : rowHeight + rowHeight * 0.1;
// }

      // Lưu file output
  const outputFilePath = `outputs/edit-height/${req.file.filename}`;
  await workbook.xlsx.writeFile(outputFilePath);
      res.json({
          message: 'success'
      })
   
})

module.exports = router;