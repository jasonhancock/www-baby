$(function() {
    var service_ok = '[  [[;#0a0;]OK]  ]';
    var service_failed = '[[[;#a00;]FAILED]]';
    var sysctl_vars = { 'birth.type': 'vaginal' };
    var services = {
        oliver: {
            name: 'Oliver Monroe Hancock',
            status: false,
            weight: '7 lbs, 3 oz',
            length: '21',
            image: 'http://i.imgur.com/J0oD390.png',
            commands: {
                start: oliver_start,
                status: true
            }
        },
        dexter: {
            name: 'Dexter Brian Hancock',
            status: true,
            time: new Date("17 Aug 2010 19:55:00 PDT"),
            weight: '7 lbs, 6.5 oz',
            length: '22',
            image: 'http://i.imgur.com/qI62UGr.jpg',
            commands: {
                start: true,
                status: true
            }
        }
    };

    // Main interpreter function
    function interpreter(input, term) {
        var command, inputs;
        inputs = input.split(/ +/)
        command = inputs[0];
        if (command === "service") {
            service(inputs, term);
        } else if (command === "sysctl") {
            sysctl(inputs, term);
        } else if (command.length === 0) {
            // do nothing
        } else {
            term.error('-bash: ' + command + ': command not found');
        }
    }

    function sysctl(inputs, term){
        if(!inputs[1] && !inputs[2]) {

        } else if(!inputs[2]) {
            if(inputs[1] == '-a') {
                var keys = Object.keys(sysctl_vars).sort();
                $.each(keys, function( index, value ) {
                    term.echo(value + ' = ' + sysctl_vars[value]);
                });
            } else if(inputs[1] == '-w') {
                // noop
            } else if(inputs[1] in sysctl_vars) {
                term.echo(inputs[1] + ' = ' + sysctl_vars[inputs[1]]);
            } else {
                term.echo("error: \"" + inputs[1] + "\" is an unknown key");
            }
        } else if(inputs[1] == '-w') {
            if(inputs[2]) {
                var pieces = inputs[2].split(/=/);
                if(pieces.length > 2) {
                    term.echo("error: \"Invalid argument\" setting key \"" + pieces[0] + "\"");
                } else if(pieces.length == 1) {
                    term.echo("error: \"" + pieces[0] + "\" must be of the form name=value");
                } else {
                    sysctl_vars[pieces[0]] = pieces[1];
                    term.echo(pieces[0] + ' = ' + sysctl_vars[pieces[0]]);

                    if(pieces[0] == 'birth.type' && pieces[1] == 'caesarean') {
                        term.insert('service oliver start');
                    }
                }
            } else {
                // sysctl doesn't do anything if you forget to specify the key
            }
        }
    }

    function service_status(inputs, term) {
        if(!services[inputs[1]].status) {
            term.echo(inputs[1] + ' is stopped');
        } else {
            term.echo(inputs[1] + '(' + services[inputs[1]].name + ') is running');
            term.echo('The service is ' + age(services[inputs[1]].time) + ' old');
            term.echo('The service is ' + services[inputs[1]].weight + ' and ' + services[inputs[1]].length + ' inches long');
            term.echo('<img src="' + services[inputs[1]].image + '">', { raw: true});
            term.echo('');
        }
    }

    function service_start(inputs, term) {
        term.echo('Starting ' + inputs[1] + ':');

        if(services[inputs[1]].status) {
            term.echo('Service ' + inputs[1] + ' already running');
            return;
        }

        var callback = services[inputs[1]].commands[inputs[2]];
        var result = {
            success: true,
            output: [],
            start_time: new Date()
        };

        if(typeof callback === "function") {
            result = callback(term);
        }

        term.echo((result.success ? service_ok : service_failed), {
            finalize: function(div) {
                div
                .css("width", "350px")
                .css("text-align", "right")
                .css("margin-top", "-1em");
            }
        });

        $.each(result.output, function(index, value) {
            term.echo(value);
        });

        services[inputs[1]].status = result.success;
        if(result.success) {
            services[inputs[1]].time = result.start_time;
        }
    }

    function oliver_start(term) {
        if(sysctl_vars['birth.type'] == 'caesarean') {
            term.insert('service oliver status');
            return {
                start_time: new Date("7 Sep 2014 18:16:00 PDT"),
                success: true,
                output: [
                    "Check the status of the service by running:",
                    "    service oliver status"
                ]
            };
        } else {
            term.insert('sysctl -w birth.type=caesarean');
            return {
                success: false,
                output: [
                    "Try setting the \"birth.type\" kernel parameter with the sysctl command:",
                    "    sysctl -w birth.type=caesarean"
                ]
            };
        }
    }

    function service(inputs, term){
        // No second argument
        if (!inputs[1] || !inputs[2]) {
            term.echo('Usage: service <service_name> <command>');
        } else if (!(inputs[1] in services)) {
            term.echo(inputs[1] + ': unrecognized service');
        } else {
            // Validate the service supports the command
            if(!(inputs[2] in services[inputs[1]].commands)) {
                var cmds = Object.keys(services[inputs[1]].commands).join('|');
                term.echo('Usage: ' + inputs[1] + ' {' + cmds + '}');
            } else {
                if(inputs[2] == 'start') {
                    service_start(inputs, term);
                } else if(inputs[2] == 'status') {
                    service_status(inputs, term);
                }
            }
        }
    }

    // Approximation of age in years, days, hours, minutes, seconds
    function age(date) {
        var now = (new Date()).getTime() / 1000;
        var remaining = now - date.getTime() / 1000;

        var factors = [];
        factors['seconds'] = 1;
        factors['minutes'] = 60 * factors['seconds'];
        factors['hours']   = 60 * factors['minutes'];
        factors['days']    = 24 * factors['hours'];
        factors['years']   = 365 * factors['days'];

        var pieces = [];

        var keys = Object.keys(factors).reverse();

        for(i=0; i<keys.length; i++) {
            var count = Math.floor(remaining/factors[keys[i]]);
            if(count > 0) {
                pieces.push(count + ' ' + keys[i]);
            }

            remaining = remaining - count * factors[keys[i]];
        }

        return pieces.join(', ');
    }


    $('#terminal').terminal( interpreter, {
        prompt: "[[b;#d33682;]root]@[[b;#6c71c4;]hospital] ~$ ",
        name: 'announce',
        height: 600,
        greetings: '',
        onInit: function(term){
            term.insert("service oliver start");
            term.history().clear();
        }
    });
});
