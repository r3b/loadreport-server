template '/etc/init/loadreport-server.conf' do
  source 'loadreport-server.conf.erb'
  mode 0440
end
service "loadreport-server" do
	provider Chef::Provider::Service::Upstart
  action :start
end
