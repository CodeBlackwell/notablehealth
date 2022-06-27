const express = require("express")

const router = express.Router()
const doctorsRouter = require('./doctors')
const appointmentsRouter = require('./appointments')


const IndexController = require("../controllers/index.controller")
const { validate } = require("../middlewares/validators/wrapper.validator")
const {
    indexValidator
} = require("../middlewares/validators/index.validations")

router.get("/", IndexController.index)
router.post("/", validate(indexValidator), IndexController.indexPost)

router.use("/doctors", doctorsRouter)
router.use("/appointments", appointmentsRouter)

module.exports = router
