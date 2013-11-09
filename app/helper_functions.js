var path = require('path'),
async = require('async'); 


function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 
// Function to download file using wget
function downloadFile(name,file_url,directory,callback) {
	console.log("Start Downloading file: " + file_url + "...");
    // compose the wget command
    var wget = 'wget -P ' + directory + ' ' + file_url;
    // excute wget using child_process' exec function

    var child = exec(wget, function(err, stdout, stderr) {
        if (err) {
        	console.log("ERROR WGET: Failed to download file: " + name + "!");
        	throw err;
        } else {
        	console.log("File downloaded: " + name + ' into ' + directory);
        	
        }
        var c = exec("mv "+directory+"/"+file_url.split("file/")[1] +" "+ directory+"/"+name, function(err, stdout, stderr) {
        	if (err) {
        		console.log("ERROR renaming...");
        	}
        	console.log("Renamed file from" + file_url.split("file/")[1] +" to "+ name);
        	callback(name);
        });
    });
};




module.exports.validateEmail = validateEmail;
module.exports.downloadFile = downloadFile;

