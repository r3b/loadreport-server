#
# Cookbook Name:: phantomjs_flash
# Recipe:: default
#
# Copyright 2013, YOUR_COMPANY_NAME
#
# All rights reserved - Do Not Redistribute
#
include_recipe "apt"
#apt_repository "restricted" do
#  uri "http://us.archive.ubuntu.com/ubuntu/"
#  components ["lucid", "restricted", "multiverse"]
#end
#apt_repository "extras" do
#  uri "http://extras.ubuntu.com/ubuntu"
#  components ["lucid", "main"]
#end
#apt_repository "partners" do
#  uri "http://archive.canonical.com/"
#  components ["lucid", "partner"]
#  notifies :run, resources(:execute => "apt-get update"), :immediately
#end

%w{build-essential g++ openssl chrpath libssl-dev libfontconfig1-dev xvfb 
	libglib2.0-dev libx11-dev libxext-dev libfreetype6-dev libxcursor-dev 
	libxrandr-dev libxv-dev libxi-dev libgstreamermm-0.10-dev libgstreamermm-0.10-2 
	flashplugin-installer}.each do |pkg|
  package pkg do
    action :install
  end
end
