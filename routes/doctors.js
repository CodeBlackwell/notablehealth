var express = require('express')
var Airtable = require('airtable')
const { restoreDefaultPrompts } = require('inquirer')
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
const physiciansTable = base('Doctors')
const appointmentsTable = base('Appointments')
// instantiate router
const router = express.Router()

const getDoctorsNames = async (req, res)=> {
    const doctorNames = []
    const records = await physiciansTable.select({view: "Grid view"}).eachPage(async (records, fetchNextPage) => {
        records.forEach(record => {
            doctorNames.push({
                name: record.get('Name'),
                physicianID: record.get('PhysicianID')
            })
        })
        fetchNextPage();
    },function done(err) {
        if (err) {
            console.error(err); return; 
            res.status(500).json(err)
        }
        else {
            res.status(200).json(doctorNames)
            return doctorNames
        }
    })
}

const getDoctorById = async (id) => {
    return await physiciansTable.find(id)
}
router.get('/', (req, res) => {
    getDoctorsNames(req,res)
})
/**
 * Route to pull all appointments for a specified physician. Current Only returns Appointment ID's
 */
router.get('/:physician_id', async (req, res) => {
    
    const doctor = await getDoctorById(req.params.physician_id)

    doctor.fields.Appointments.map(async apt_id => {
      let apt = await getAppointmentById(req, res, apt_id)
    })
    res.json(doctor.fields.Appointments)
})


module.exports = router