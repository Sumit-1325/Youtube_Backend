import multer from "multer"
import { v4 as uuidv4 } from "uuid"
import path from "path"



// used to generate random file name in node


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname); // Preserve the file extension
        const newName = `file-${uuidv4()}${extension}`; // Create unique filename
        cb(null, newName);
    }
  })
  const upload = multer({storage})

  export default upload