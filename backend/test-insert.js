const { supabase } = require('./dist/services/supabase');
const { sendNotification } = require('./dist/services/firebaseAdmin');

async function testInsertAttendance() {
  try {
      const now = new Date();

      const testData = {
          erpid: '23511356',
          date: now.toISOString().split('T')[0],
          login_time: new Date().toISOString(),  // ✅ full timestamp
          logout_time: new Date().toISOString(), // ✅ full timestamp
          status: 'present'
      };

    console.log('Inserting test attendance:', testData);

    const { data, error } = await supabase
      .from('attendance_logs')
      .insert(testData)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return;
    }

    console.log('Inserted data:', data);

    console.log('Sending notification...');
    await sendNotification(testData.erpid);

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testInsertAttendance();