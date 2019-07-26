#!/bin/sh

while :
do
	>&2 echo "Starting update at $(date)"
	node src/index.js
	>&2 echo "Finished with update. Waiting ${UPDATE_INTERVAL} seconds until next update."
	sleep $UPDATE_INTERVAL
done