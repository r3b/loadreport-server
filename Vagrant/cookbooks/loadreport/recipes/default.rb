#
# Cookbook Name:: loadreport
# Recipe:: default
#
# Copyright 2013, YOUR_COMPANY_NAME
#
# All rights reserved - Do Not Redistribute
#
magic_shell_environment 'PATH' do
  value "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/vagrant/app/bin/phantomjs--linux-i686/bin"
end
bash "install modules" do
  user "root"
  cwd "/home/vagrant/app"
  code <<-EOH
    npm install
  EOH
end
