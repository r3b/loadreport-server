template '/etc/init/xvfb.conf' do
  source 'xvfb.conf.erb'
  mode 0440
end
service "xvfb" do
	provider Chef::Provider::Service::Upstart
  action :start
end
magic_shell_environment 'DISPLAY' do
  value ":99.0"
end
