#!/bin/bash
set -x verbrose
echo "Starting hGraph server"
cd /home/git/hGraph
http-server &
echo "Starting hMixerr rails-server"
cd /home/git/hMixer/hmixer-server 
rails s &

