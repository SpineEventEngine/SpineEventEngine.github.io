#!/bin/bash

# Standard update precedure.
sudo apt-get install -y libxml2-dev
sudo apt-get update

# Fetch custom Google indexes. They contain such tools as `dart`.
sudo apt-get install apt-transport-https
sudo sh -c 'curl https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -'
sudo sh -c 'curl https://storage.googleapis.com/download.dartlang.org/linux/debian/dart_stable.list > /etc/apt/sources.list.d/dart_stable.list'
sudo apt-get update
