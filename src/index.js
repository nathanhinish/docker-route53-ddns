if (!process.env.AWS_ACCESS_KEY_ID) {
  console.info('Environment variable AWS_ACCESS_KEY_ID not found');
  process.exit(1);
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  console.info('Environment variable AWS_SECRET_ACCESS_KEY not found');
  process.exit(1);
}
if (!process.env.UPDATE_FILE) {
  console.info('Environment variable UPDATE_FILE not found');
  process.exit(1);
}

const path = require('path');
const fs = require('fs-extra');
const publicIp = require('public-ip');
const AWS = require('aws-sdk');

const UPDATES = fs.readJSONSync(process.env.UPDATE_FILE, 'utf8');

const service = new AWS.Route53();
let publicipAddress;
const status = [];

const submitChanges = async params =>
  new Promise((resolve, reject) => {
    service.changeResourceRecordSets(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });

const getUpdate = async params =>
  new Promise((resolve, reject) => {
    service.getChange(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });

const waitForNotPending = async params =>
  new Promise((resolve, reject) => {
    const handle = setInterval(async () => {
      try {
        const { ChangeInfo: { Status }} = await getUpdate(params);
        if (Status === 'INSYNC') {
          clearInterval(handle);
          resolve();
        }
      } catch (err) {
        clearInterval(handle);
        reject(err);
      }
    }, 1000);
  });

const processUpdate = async update => {
  const Value = publicipAddress;
  const { HostedZoneId, Common, Records } = update;
  const params = {
    HostedZoneId,
    ChangeBatch: {
      Changes: Records.map(Record => ({
        Action: 'UPSERT',
        ResourceRecordSet: {
          ResourceRecords: [{ Value }],
          ...Common,
          ...Record
        }
      }))
    }
  };

  const {
    ChangeInfo: { Id }
  } = await submitChanges(params);
  await waitForNotPending({ Id });

  console.info(`${HostedZoneId} is updated`);
};

const main = async () => {
  publicipAddress = await publicIp.v4();
  try {
    await Promise.all(UPDATES.map(processUpdate));
  } catch (err) {
    console.error(err);
  }
};

main();
