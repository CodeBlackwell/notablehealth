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

const createAppointments = async (req, res, records) => {
    const validMinutes = {"0": True, "15": True, "30": True, "45": True}
    for(let x = 0; x < records.length; x++) {
        let convertedDate = new Date(records[x].fields.Date)
        if (!validMinutes[convertedDate.getMinutes]){
            res.status(400).send("Appointments can only be made at 15 minute intervals (0, 15, 30, 45)") 
            return
        }
    }
    base('Appointments').create(records, function(err, records) {
        if (err) {
          console.error(err);
          return;
        }
        records.forEach(function (record) {
          console.log(record.getId());
        });
      });

    res.send(200)
}

const getAppointmentById = async (req, res, id) => find(id, function(err, record) {
    if (err) { console.error(err); return; }
    console.log('Retrieved', record.id);
});

const deleteAppointmentById = async (id) => {
    try {
        const table = base('Appointments')
        const destroyedRecord = await table.destroy(id)
    } catch(err) {
        console.log(err)
    }
    

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
    const apts = doctor.fields.Appointments.map(async apt_id => {
      let apt = await getAppointmentById(req, res, apt_id)
      
    })
    res.json(doctor.fields.Appointments)
    // const promises = doctor.fields.Appointments.map(async apt_id => {
    //     const apt_details = await getAppointmentById(req, res, apt_id)
    //     return apt_details
    //   })

    // const appointments = await Promise.all(promises)
    // console.log(appointments)
})

router.get('/appointments/:appointment_id', (req, res) => {
    console.log(getAppointmentById(req.params.appointment_id))
    res.status(200).json(getAppointmentById(req.params.appointment_id))
})
router.delete('/appointments/:appointment_id', (req, res) => {
    deleteAppointmentById(req.params.appointment_id)
    res.status(200).send(`Appointment: ${req.params.appointment_id} has been deleted`)
})

router.post('/appointments/:appointment_fields', (req, res) => {
    createAppointments(req, res, req.params.appointment_fields)
})

module.exports = router