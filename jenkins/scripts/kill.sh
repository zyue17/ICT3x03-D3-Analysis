#!/usr/bin/env sh
cd front_end
echo 'The following command terminates the "npm start" process using its PID'
echo '(written to ".pidfile"), all of which were conducted when "deliver.sh"'
echo 'was executed.'
set -x
kill $(cat .pidfile)
