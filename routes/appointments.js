var express = require('express')
var Airtable = require('airtable')
const { restoreDefaultPrompts } = require('inquirer')
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
const physiciansTable = base('Doctors')
const appointmentsTable = base('Appointments')
// instantiate router
const router = express.Router()

const getAppointmentById = async (id) => {
    return await appointmentsTable.find(id)
}

const createAppointments = async (req, res, records) => {
    const validMinutes = {"0": True, "15": True, "30": True, "45": True}
    for(let x = 0; x < records.length; x++) {
        let convertedDate = new Date(records[x].fields.Date)
        if (!validMinutes[convertedDate.getMinutes()]){
            res.status(400).send("Appointments can only be made at 15 minute intervals (0, 15, 30, 45)")
            return
        }
    }
    appointmentsTable.create(records, function(err, newRecord) {
        if (err) {
          console.error(err);
          return;
        }
        newRecord.forEach(function (record) {
          console.log(record.getId());
        });
      });

    res.send(200)
}



const listAllAppointments = async (req, res)=> {
    const AppointmentDetails = []
    const records = await appointmentsTable.select().eachPage(async (records, fetchNextPage) => {
        records.forEach(record => {
            AppointmentDetails.push({
                name: record.get('Name')
            })
        })
        fetchNextPage();
    },function done(err) {
        if (err) {
            console.error(err);
            res.status(500).json(err)
        }
        else {
            res.status(200).json(AppointmentDetails)
        }
    })
}

const deleteAppointmentById = async (id) => {
    try {
        const table = base('Appointments')
        const destroyedRecord = await table.destroy(id)
        return destroyedRecord
    } catch(err) {
        console.log(err)
    }
}
router.get('/', async(req, res) => {
    listAllAppointments(req, res)
})
/**
 * Route to pull all appointments for a specified physician. Current Only returns Appointment ID's
 */

router.route('/:appointment_id')
    .get((req, res) => {
    console.log(getAppointmentById(req.params.appointment_id))
    res.status(200).json(getAppointmentById(req.params.appointment_id))
    })

    .delete((req, res) => {
    deleteAppointmentById(req.params.appointment_id)
    res.status(200).send(`Appointment: ${req.params.appointment_id} has been deleted`)
    })

    router.post( (req, res) => {
        createAppointments(req, res, req.body)
    })

module.exports = router