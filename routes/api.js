const express = require("express")

const router = express.Router()
var doctorsRouter = require('./doctors')


const IndexController = require("../controllers/index.controller")
const { validate } = require("../middlewares/validators/wrapper.validator")
const {
    indexValidator
} = require("../middlewares/validators/index.validations")

router.get("/", IndexController.index)
router.post("/", validate(indexValidator), IndexController.indexPost)

router.use("/doctors", doctorsRouter)


module.exports = router
