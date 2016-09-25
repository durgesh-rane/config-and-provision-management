var os = require('os');
var fs = require('fs');
var AWS = require('aws-sdk');

AWS.config.update({
  "accessKeyId":process.env.AWS_Access_Key_Id,
  "secretAccessKey":process.env.AWS_Secret_Access_Key,
  "region":"us-west-1"
}
);

var ec2 = new AWS.EC2();

var params = {
  ImageId: 'ami-48db9d28', // Amazon Linux AMI x86_64 EBS
  InstanceType: 't2.micro',
  MinCount: 1, 
  MaxCount: 1,
  KeyName: "AWS_HW1",
  SecurityGroups: ["DevOps"]
};


console.log("Attempting to create instance: ", JSON.stringify(params));
ec2.runInstances(params, function(err, data) {
  if (err) { 
	console.log(data)
  	console.log("Could not create instance", err); 
  	return; 
	}
  console.log(data);

  var instanceId = data.Instances[0].InstanceId;
  console.log("Created instance:", instanceId);   
  console.log("getting public ipaddress of instance...");
  setTimeout(function(){ec2.describeInstances({InstanceIds:[instanceId]}, function(err, data){
  	if (err) { 
  			console.log("Could not find instance", err); 
  			return; 
		}
		console.log("recieved public ip address: ",data.Reservations[0].Instances[0].PublicIpAddress);
		console.log("writing to inventory file...");
		var inventorydata = "node0 ansible_ssh_host=" + data.Reservations[0].Instances[0].PublicIpAddress + " ansible_ssh_user=ubuntu ansible_ssh_private_key_file=/home/rane/Desktop/DevOps/HW1/AWS_HW1.pem\n";
		fs.appendFileSync('inventory', inventorydata, encoding='utf8');
		console.log("finished writing to inventory file");
  });},30000);

});
