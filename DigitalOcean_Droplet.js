var needle = require("needle");
var os   = require("os");
var fs = require('fs');

var config = {};
config.token = process.env.Digital_Ocean_Token;

var headers =
{
	'Content-Type':'application/json',
	Authorization: 'Bearer ' + config.token
};

// Documentation for needle:
// https://github.com/tomas/needle

var client =
{
	/*listRegions: function( onResponse )
	{
		needle.get("https://api.digitalocean.com/v2/regions", {headers:headers}, onResponse)
	},*/
	/*listImages: function( onResponse )
	{
		needle.get("https://api.digitalocean.com/v2/images", {headers:headers}, onResponse)
	},*/
	//var dropletId = "25454992";
	listDroplets: function( dropletId, onResponse )
	{
		needle.get("https://api.digitalocean.com/v2/droplets/"+dropletId,{headers:headers}, onResponse)
	},

	createDroplet: function (dropletName, region, imageName, onResponse)
	{
		var data = 
		{
			"name": "drane" + os.hostname(),
			"region":"nyc1",
			"size":"512mb",
			"image":"ubuntu-14-04-x64",
			// Id to ssh_key already associated with account.
			"ssh_keys":[3385489],
			//"ssh_keys":null,
			"backups":false,
			"ipv6":false,
			"user_data":null,
			"private_networking":null
		};

		console.log("Attempting to create: "+ JSON.stringify(data) );

		needle.post("https://api.digitalocean.com/v2/droplets", data, {headers:headers,json:true}, onResponse );
	}
};

// #############################################
// #1 Print out a list of available regions
// Comment out when completed.
// https://developers.digitalocean.com/documentation/v2/#list-all-regions
// use 'slug' property
/*client.listRegions(function(error, response)
{
	var data = response.body;
	//console.log( JSON.stringify(response.body) );

	if( response.headers )
	{
		console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
	}

	if( data.regions )
	{
		for(var i=0; i<data.regions.length; i++)
		{
			console.log(data.regions[i]);
		}
	}
});
*/

// #############################################
// #2 Extend the client object to have a listImages method
// Comment out when completed.
// https://developers.digitalocean.com/documentation/v2/#images
// - Print out a list of available system images, that are AVAILABLE in a specified region.
// - use 'slug' property
/*client.listImages(function(error, response)
{
	var data = response.body;
	//console.log( JSON.stringify(response.body) );

	if( response.headers )
	{
		console.log( "Calls remaining", response.headers["ratelimit-remaining"] );
	}

	if( data.images)
	{
		for(var i=0; i<data.images.length; i++)
		{
			console.log(data.images[i].slug);
		}
	}
});
*/
// #############################################
// #3 Create an droplet with the specified name, region, and image
// Comment out when completed. ONLY RUN ONCE!!!!!
// Write down/copy droplet id.
 var name = "drane"+os.hostname();
 var region = "nyc1"; // Fill one in from #1
 var image = "ubuntu-14-04-x64"; // Fill one in from #2
client.createDroplet(name, region, image, function(err, resp, body)
{	

	var dropletId = body.droplet.id;
 	var interval = setInterval(function(){		//console.log( JSON.stringify( body, null, 3 ) );
	client.listDroplets(dropletId, function(error, response)
	{
        	var data = response.body;
		var droplet_ip;
		if(data.droplet)
        	{
			droplet_ip = data.droplet.networks.v4[0].ip_address;
			clearInterval(interval);
        		console.log("IP of droplet: "+droplet_ip);
		}
        	console.log("writing to inventory file...");
        	var inventorydata = "node1 ansible_ssh_host=" + droplet_ip + " ansible_ssh_user=root ansible_ssh_private_key_file=/home/rane/Desktop/DevOps/HW1/DigitalOcean_key\n";
        	fs.appendFileSync('inventory', inventorydata, encoding='utf8');
        	console.log("finished writing to inventory file");
	});
	},1000);
});

// #############################################
// #4 Extend the client to retrieve information about a specified droplet.
// Comment out when done.
// https://developers.digitalocean.com/documentation/v2/#retrieve-an-existing-droplet-by-id
// REMEMBER POST != GET
// Most importantly, print out IP address!
//var dropletId = "25454992";
client.listDroplets(function(error, response)
{
        var data = response.body;
        //console.log( JSON.stringify(response.body) );
	var droplet_ip;
	console.log("Printing droplets: "+data.droplets);
        droplet_ip = data.droplets[0].networks.v4[0].ip_address;
        console.log("IP of droplet: "+droplet_ip);

                console.log("writing to inventory file...");
                var inventorydata = "node1 ansible_ssh_host=" + droplet_ip + " ansible_ssh_user=ec2-user ansible_ssh_private_key_file=/home/rane/Desktop/DevOps/HW1/DigitalOcean_key\n";
                fs.appendFileSync('droplet_inventory', inventorydata, encoding='utf8');
                console.log("finished writing to inventory file");

});
// #############################################
// #5 In the command line, ping your server, make sure it is alive!
// ping xx.xx.xx.xx

// #############################################
// #6 Extend the client to DESTROY the specified droplet.
// Comment out when done.
// https://developers.digitalocean.com/documentation/v2/#delete-a-droplet
// HINT, use the DELETE verb.
// HINT #2, needle.delete(url, data, options, callback), data needs passed as null.
// No response body will be sent back, but the response code will indicate success.
// Specifically, the response code will be a 204, which means that the action was successful with no returned body data.
// 	if(!err && resp.statusCode == 204)
// 	{
//			console.log("Deleted!");
// 	}

// #############################################
// #7 In the command line, ping your server, make sure it is dead!
// ping xx.xx.xx.xx
// It could be possible that digitalocean reallocated your IP address to another server, so don't fret it is still pinging.
