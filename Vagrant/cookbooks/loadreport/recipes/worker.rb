template '/etc/init/loadreport-worker.conf' do
  source 'loadreport-worker.conf.erb'
  mode 0440
end
service "loadreport-worker" do
	provider Chef::Provider::Service::Upstart
  action :start
end
