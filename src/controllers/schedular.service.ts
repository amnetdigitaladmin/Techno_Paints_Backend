var cron = require('node-cron');
import moment = require('moment');
import AMCService from '../controllers/AMC.service';

class schedularService {
    public async runSchedulars() {
        // cron.schedule(process.env.AMC_INACTIVE_CRON_TIME, async () => {  // Everyday 11:00 AM IST
        //     console.log('Make AMC inactive Based on AMC End Date Schedular Started', moment().format("DD-MM-YYYY HH:mm:ss"));
        //     await AMCService.inactiveAMCsAfterSubscriptionEnded();
        //     console.log('Make AMC inactive Based on AMC End Date Schedular Completed', moment().format("DD-MM-YYYY HH:mm:ss"));
        // }, {
        //     timezone: 'Asia/Kolkata'
        // }),
        // cron.schedule(process.env.CARRY_FORWARD_CRON_TIME, async () => {  // Every start of the year first day
        //     console.log('Carry Forward Schedular Started', moment().format("DD-MM-YYYY HH:mm:ss"));
        //     await AMCService.carryForwardSchedular()
        //     console.log('Carry ForwardSchedular Schedular Completed', moment().format("DD-MM-YYYY HH:mm:ss"));
        // }, {
        //     timezone: 'Asia/Kolkata'
        // })
    }

    
}
export default new schedularService();

