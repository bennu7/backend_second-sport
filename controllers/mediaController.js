const { imagekit } = require('../helpers');
const { ProductImage } = require('../models');

module.exports = {
   imageUpload: async (req, res) => {
        try {
            const file = req.file.buffer.toString("base64");
            const namaFile = Date.now() + '-' + req.file.originalname;


            const upload = await imagekit.upload({
                file: file,
                fileName: namaFile
            });

            const image = await ProductImage.create({
                image_url: upload.url
            });

            res.status(200).json({
                status: true,
                message: "success",
                data: image
            });

        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    },
    
    imageMulti: async (req, res)=>{
        try{
            let images = []

            for(element of req.files){
                const file = element.buffer.toString("base64");
                const namaFile = Date.now() + '-' + element.originalname;
            
            
                const upload = await imagekit.upload({
                    file: file,
                    fileName: namaFile
                });
            
                const image = await ProductImage.create({
                    image_url: upload.url
            
                });
                images.push({
                    id: image.id,
                    url: image.image_url
                })
            }

            res.status(200).json({
                status: true,
                message: "success",
                data: images
            });

        }
        catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message,
                data: null
            });
        }
    }
};
